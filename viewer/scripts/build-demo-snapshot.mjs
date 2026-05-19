import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Unzip, UnzipInflate } from "fflate";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const ZIP_PATH = join(REPO_ROOT, "viewer", "demo-source", "package.zip");
const OUT_DIR = join(REPO_ROOT, "viewer", "public");
const OUT_PATH = join(OUT_DIR, "demo-snapshot.json");

if (!existsSync(ZIP_PATH)) {
  console.error("");
  console.error("  No demo source found.");
  console.error("  Place your real Discord package.zip at:");
  console.error("    " + ZIP_PATH);
  console.error("");
  process.exit(1);
}

const TEXT = new TextDecoder("utf-8");
const ACCOUNT_USER = "Account/user.json";
const ACCOUNT_AVATAR = "Account/avatar.jpeg";
const MESSAGES_INDEX = "Messages/index.json";
const CHANNEL_RX = /^Messages\/(c[^/]+)\/(channel|messages)\.json$/;

const small = {};
const channelEntries = new Map();

function bufferEntry(stream, onDone) {
  const chunks = [];
  let size = 0;
  stream.ondata = (err, chunk, final) => {
    if (err) throw err;
    if (chunk && chunk.byteLength) {
      chunks.push(chunk);
      size += chunk.byteLength;
    }
    if (final) {
      const flat = new Uint8Array(size);
      let off = 0;
      for (const c of chunks) {
        flat.set(c, off);
        off += c.byteLength;
      }
      onDone(flat);
    }
  };
  stream.start();
}

console.log("Reading " + ZIP_PATH);

await new Promise((resolve, reject) => {
  const unzipper = new Unzip(stream => {
    const name = stream.name.replace(/\\/g, "/");
    if (name === ACCOUNT_USER) {
      bufferEntry(stream, buf => (small.user = buf));
      return;
    }
    if (name === ACCOUNT_AVATAR) {
      bufferEntry(stream, buf => (small.avatar = buf));
      return;
    }
    if (name === MESSAGES_INDEX) {
      bufferEntry(stream, buf => (small.index = buf));
      return;
    }
    const m = CHANNEL_RX.exec(name);
    if (m) {
      const dir = m[1];
      const part = m[2];
      let pair = channelEntries.get(dir);
      if (!pair) {
        pair = {};
        channelEntries.set(dir, pair);
      }
      bufferEntry(stream, buf => (pair[part] = buf));
    }
  });
  unzipper.register(UnzipInflate);

  const reader = createReadStream(ZIP_PATH);
  reader.on("data", chunk => {
    try {
      unzipper.push(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength), false);
    } catch (e) {
      reject(e);
    }
  });
  reader.on("end", () => {
    try {
      unzipper.push(new Uint8Array(0), true);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
  reader.on("error", reject);
});

if (!small.user) {
  console.error("This doesn't look like a Discord export (no Account/user.json).");
  process.exit(1);
}

const userJson = JSON.parse(TEXT.decode(small.user));
const ownerId = userJson.id ?? "unknown";
const ownerUsername = userJson.username ?? "unknown";
let ownerCreatedAt = null;
if (userJson.created_at) {
  const t = Date.parse(userJson.created_at);
  if (!Number.isNaN(t)) ownerCreatedAt = t;
}
if (ownerCreatedAt == null && /^\d+$/.test(ownerId)) {
  try {
    ownerCreatedAt = Number((BigInt(ownerId) >> 22n) + 1420070400000n);
  } catch {}
}

const messagesIndex = small.index ? JSON.parse(TEXT.decode(small.index)) : {};

function parseTimestamp(s) {
  if (!s || s.length < 19) return 0;
  const c = i => s.charCodeAt(i) - 48;
  const y = c(0) * 1000 + c(1) * 100 + c(2) * 10 + c(3);
  const mo = c(5) * 10 + c(6);
  const d = c(8) * 10 + c(9);
  const h = c(11) * 10 + c(12);
  const mi = c(14) * 10 + c(15);
  const se = c(17) * 10 + c(18);
  return Date.UTC(y, mo - 1, d, h, mi, se);
}

function defaultAvatarUrl(userId) {
  try {
    const n = Number((BigInt(userId) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${n}.png`;
  } catch {
    return `https://cdn.discordapp.com/embed/avatars/0.png`;
  }
}

const GUILD_INDEX_RX = /^(.+) in (.+)$/;
function cleanDmName(raw) {
  let s = String(raw ?? "").trim();
  s = s.replace(/^Direct Message with\s+/i, "");
  s = s.replace(/#0+$/i, "");
  return s.trim();
}

function getDisplayName(channel, index) {
  if (channel.type === "DM") {
    const fromIdx = index[channel.id];
    if (fromIdx) return cleanDmName(fromIdx);
    const otherId = channel.recipients?.[1] ?? channel.recipients?.[0] ?? channel.id;
    return `User ${String(otherId).slice(-4)}`;
  }
  if (channel.type === "GROUP_DM") {
    const own = channel.name?.trim?.();
    if (own) return own;
    const fromIdx = index[channel.id];
    if (fromIdx && fromIdx !== "None" && fromIdx !== "Unknown channel") return fromIdx;
    const recipients = channel.recipients ?? [];
    if (recipients.length > 0) {
      const head = recipients.slice(0, 4).join(", ");
      const more = recipients.length - 4;
      return more > 0 ? `${head}, +${more}` : head;
    }
    return `Untitled group chat #${channel.id.slice(-6)}`;
  }
  if (channel.type === "GUILD_TEXT") {
    const own = channel.name?.trim?.();
    if (own) return own;
    const m = GUILD_INDEX_RX.exec(index[channel.id] ?? "");
    if (m && m[1] !== "Unknown channel") return m[1];
    return `#${channel.id.slice(-6)}`;
  }
  return `Channel ${String(channel.id ?? "").slice(-4)}`;
}

function resolveServerName(channel, index) {
  if (channel.type !== "GUILD_TEXT") return `Server ${String(channel.id).slice(-4)}`;
  const fromGuild = channel.guild?.name?.trim?.();
  if (fromGuild) return fromGuild;
  const m = GUILD_INDEX_RX.exec(index[channel.id] ?? "");
  if (m) return m[2];
  return `Server ${String(channel.guild?.id ?? channel.id).slice(-4)}`;
}

const ownerAvatarUrl = defaultAvatarUrl(ownerId);
const summaries = [];
const messagesByChannel = {};

console.log("Parsing " + channelEntries.size + " channels...");

for (const [, pair] of channelEntries) {
  if (!pair.channel || !pair.messages) continue;
  let channel;
  try {
    channel = JSON.parse(TEXT.decode(pair.channel));
  } catch {
    continue;
  }
  if (channel.type !== "DM" && channel.type !== "GROUP_DM" && channel.type !== "GUILD_TEXT") continue;

  let rawMessages;
  try {
    rawMessages = JSON.parse(TEXT.decode(pair.messages));
  } catch {
    continue;
  }
  if (!Array.isArray(rawMessages)) continue;

  const messages = rawMessages
    .map(raw => ({
      id: String(raw.ID),
      timestamp: parseTimestamp(raw.Timestamp),
      contents: raw.Contents ?? "",
      attachmentsRaw: raw.Attachments ?? "",
      authorId: ownerId,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const kind = channel.type === "DM" ? "dm" : channel.type === "GROUP_DM" ? "group" : "server";
  const displayName = getDisplayName(channel, messagesIndex);

  let participants;
  if (kind === "dm") {
    const [a, b] = channel.recipients ?? [];
    const otherId = a === ownerId ? b : a;
    participants = [
      { id: ownerId, username: ownerUsername, avatarUrl: ownerAvatarUrl, isOwner: true },
      { id: otherId ?? "unknown", username: cleanDmName(displayName), avatarUrl: defaultAvatarUrl(otherId ?? "0"), isOwner: false },
    ];
  } else if (kind === "group") {
    const ids = channel.recipients ?? [];
    const seen = new Set();
    participants = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      const isOwner = id === ownerId;
      participants.push({
        id,
        username: isOwner ? ownerUsername : undefined,
        avatarUrl: isOwner ? ownerAvatarUrl : defaultAvatarUrl(id),
        isOwner,
      });
    }
    if (!seen.has(ownerId)) {
      participants.unshift({ id: ownerId, username: ownerUsername, avatarUrl: ownerAvatarUrl, isOwner: true });
    }
  } else {
    participants = [{ id: ownerId, username: ownerUsername, avatarUrl: ownerAvatarUrl, isOwner: true }];
  }

  summaries.push({
    id: channel.id,
    kind,
    displayName,
    participants,
    messageCount: messages.length,
    firstTs: messages[0]?.timestamp ?? null,
    lastTs: messages[messages.length - 1]?.timestamp ?? null,
    serverId: kind === "server" ? channel.guild?.id : undefined,
    serverName: kind === "server" ? resolveServerName(channel, messagesIndex) : undefined,
  });

  messagesByChannel[channel.id] = messages;
}

summaries.sort((a, b) => (b.lastTs ?? 0) - (a.lastTs ?? 0));

console.log("Anonymizing...");

const BLOCK = "█";

function skeletonOf(seed, min = 5, max = 14) {
  let h = 2166136261;
  const s = String(seed ?? "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const len = min + (Math.abs(h) % (max - min + 1));
  return BLOCK.repeat(len);
}

for (const conv of summaries) {
  conv.displayName = skeletonOf(conv.id);
  if (conv.kind === "server") {
    conv.serverName = skeletonOf("server:" + (conv.serverId ?? conv.id), 6, 12);
  }
  for (const p of conv.participants) {
    if (p.isOwner) continue;
    p.username = skeletonOf("user:" + p.id, 6, 12);
    p.avatarUrl = "";
  }
}

for (const cid of Object.keys(messagesByChannel)) {
  const msgs = messagesByChannel[cid];
  for (const m of msgs) {
    m.contents = m.contents.length > 0 ? BLOCK.repeat(m.contents.length) : "";
    m.attachmentsRaw = "";
  }
}

let ownerAvatarDataUrl = null;
if (small.avatar) {
  const b64 = Buffer.from(small.avatar).toString("base64");
  ownerAvatarDataUrl = `data:image/jpeg;base64,${b64}`;
}

const snapshot = {
  manifest: {
    ownerUserId: ownerId,
    ownerDisplayName: ownerUsername,
    ownerCreatedAt,
    conversations: summaries,
  },
  messagesByChannel,
  ownerAvatarDataUrl,
};

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(snapshot));

const totalMessages = Object.values(messagesByChannel).reduce((s, arr) => s + arr.length, 0);
console.log(`Wrote ${OUT_PATH}`);
console.log(`  conversations: ${summaries.length}`);
console.log(`  messages: ${totalMessages}`);
console.log(`  owner: ${ownerUsername}`);
