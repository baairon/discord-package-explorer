/// <reference lib="webworker" />
import { AsyncUnzipInflate, Unzip, UnzipInflate, type UnzipFile } from "fflate";
import type { ConversationKind, ConversationSummary, Manifest, Message, Participant, Phase, RawChannel, RawMessage, WorkerInbound, WorkerOutbound } from "./types";
declare const self: DedicatedWorkerGlobalScope;
function parseTimestamp(s: string): number {
  if (s.length < 19) return 0;
  const c = (i: number): number => s.charCodeAt(i) - 48;
  const y = c(0) * 1000 + c(1) * 100 + c(2) * 10 + c(3);
  const mo = c(5) * 10 + c(6);
  const d = c(8) * 10 + c(9);
  const h = c(11) * 10 + c(12);
  const mi = c(14) * 10 + c(15);
  const se = c(17) * 10 + c(18);
  return Date.UTC(y, mo - 1, d, h, mi, se);
}
function normalizeMessage(raw: RawMessage): Message {
  return {
    id: String(raw.ID),
    timestamp: parseTimestamp(raw.Timestamp),
    contents: raw.Contents ?? "",
    attachmentsRaw: raw.Attachments ?? ""
  };
}
function getDefaultAvatarUrl(userId: string): string {
  try {
    const n = Number((BigInt(userId) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${n}.png`;
  } catch {
    return `https://cdn.discordapp.com/embed/avatars/0.png`;
  }
}
const DM_NAME_RX = /^Direct Message with (.+?)(?:#\d+)?$/;
function usernameFromDmDisplayName(displayName: string): string | undefined {
  const m = DM_NAME_RX.exec(displayName)?.[1];
  if (!m) return displayName.replace(/#0+$/i, "").trim() || undefined;
  return m.replace(/#0+$/i, "");
}
function buildParticipants(channel: RawChannel, displayName: string, ownerId: string, ownerUsername: string, ownerAvatarUrl: string): Participant[] {
  if (channel.type === "DM") {
    const [a, b] = channel.recipients;
    const otherId = a === ownerId ? b : a;
    return [{
      id: ownerId,
      username: ownerUsername,
      avatarUrl: ownerAvatarUrl,
      isOwner: true
    }, {
      id: otherId,
      username: usernameFromDmDisplayName(displayName),
      avatarUrl: getDefaultAvatarUrl(otherId),
      isOwner: false
    }];
  }
  if (channel.type === "GROUP_DM") {
    const ids = channel.recipients ?? [];
    const seen = new Set<string>();
    const out: Participant[] = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      const isOwner = id === ownerId;
      out.push({
        id,
        username: isOwner ? ownerUsername : undefined,
        avatarUrl: isOwner ? ownerAvatarUrl : getDefaultAvatarUrl(id),
        isOwner
      });
    }
    if (!seen.has(ownerId)) {
      out.unshift({
        id: ownerId,
        username: ownerUsername,
        avatarUrl: ownerAvatarUrl,
        isOwner: true
      });
    }
    return out;
  }
  return [];
}
function buildServerParticipants(messages: Message[], ownerId: string, ownerUsername: string, ownerAvatarUrl: string): Participant[] {
  const seen = new Set<string>([ownerId]);
  const list: Participant[] = [{
    id: ownerId,
    username: ownerUsername,
    avatarUrl: ownerAvatarUrl,
    isOwner: true
  }];
  for (const msg of messages) {
    const id = msg.authorId;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    list.push({
      id,
      avatarUrl: getDefaultAvatarUrl(id),
      isOwner: false
    });
  }
  return list;
}
const GUILD_INDEX_RX = /^(.+) in (.+)$/;
function cleanDmName(raw: string): string {
  let s = raw.trim();
  const prefix = s.match(/^Direct Message with\s+/i);
  if (prefix) s = s.slice(prefix[0].length);
  s = s.replace(/#0+$/i, "");
  return s.trim();
}
function getDisplayName(channel: RawChannel, index: Record<string, string>): string {
  if (channel.type === "DM") {
    const fromIdx = index[channel.id];
    if (fromIdx) return cleanDmName(fromIdx);
    const otherId = channel.recipients[1] ?? channel.recipients[0];
    return `User ${(otherId ?? channel.id).slice(-4)}`;
  }
  if (channel.type === "GROUP_DM") {
    const own = channel.name?.trim();
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
    const own = channel.name?.trim();
    if (own) return own;
    const m = GUILD_INDEX_RX.exec(index[channel.id] ?? "");
    if (m && m[1] !== "Unknown channel") return m[1];
    return `#${channel.id.slice(-6)}`;
  }
  return `Channel ${(channel as {
    id: string;
  }).id.slice(-4)}`;
}
function resolveServerName(channel: RawChannel, index: Record<string, string>): string {
  const idLike = channel.type === "GUILD_TEXT" ? channel.guild?.id ?? channel.id : channel.id;
  if (channel.type !== "GUILD_TEXT") return `Server ${idLike.slice(-4)}`;
  const fromGuild = channel.guild?.name?.trim();
  if (fromGuild) return fromGuild;
  const m = GUILD_INDEX_RX.exec(index[channel.id] ?? "");
  if (m) return m[2];
  return `Server ${idLike.slice(-4)}`;
}
function pickString(o: Record<string, unknown>, key: string): string | undefined {
  const v = o[key];
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return undefined;
}
function extractMessageId(rec: unknown, ownerId: string, out: Map<string, string>): void {
  if (!rec || typeof rec !== "object") return;
  const obj = rec as Record<string, unknown>;
  const eventType = typeof obj.event_type === "string" ? obj.event_type : typeof obj.type === "string" ? obj.type : "";
  if (eventType && !/send|message_send|create|send_message/i.test(eventType)) return;
  const messageId = pickString(obj, "message_id") ?? pickString(obj, "messageId") ?? pickString(obj, "id");
  if (!messageId) return;
  out.set(messageId, ownerId);
}
function fmtETA(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "almost done";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}
const TEXT = new TextDecoder("utf-8");
// Discord export folder names are localized (e.g. "Account" becomes "Compte"
// in French), but the filenames underneath them and the "c<channelId>"
// channel directory naming are stable across locales. classifyEntry only
// extracts a (root, kind) pair from the path shape — it never decides which
// root "wins". That decision is made once, deterministically, after the
// whole archive has been read (see selectAccountRoot/selectMessagesRoot in
// runIngest), so it can never depend on the order entries appear in the ZIP.
const USER_JSON_RX = /^([^/]+)\/user\.json$/;
const AVATAR_JSON_RX = /^([^/]+)\/avatar\.jpe?g$/i;
const INDEX_JSON_RX = /^([^/]+)\/index\.json$/;
const CHANNEL_DIR_RX = /^([^/]+)\/(c[^/]+)\/(channel|messages)\.json$/;
const ACTIVITY_RX = /^Activity\/(analytics|reporting|messaging|modeling)\/.+\.json$/i;
function normalizeName(name: string): string {
  return name.replace(/\\/g, "/");
}
type EntryKind = {
  kind: "skip";
} | {
  kind: "account-file";
  root: string;
  file: "user" | "avatar";
} | {
  kind: "messages-index";
  root: string;
} | {
  kind: "channel";
  root: string;
  dir: string;
  part: "channel" | "messages";
} | {
  kind: "activity";
  name: string;
};
function classifyEntry(rawName: string): EntryKind {
  const name = normalizeName(rawName);
  const userM = USER_JSON_RX.exec(name);
  if (userM) {
    return {
      kind: "account-file",
      root: userM[1],
      file: "user"
    };
  }
  const avatarM = AVATAR_JSON_RX.exec(name);
  if (avatarM) {
    return {
      kind: "account-file",
      root: avatarM[1],
      file: "avatar"
    };
  }
  const chanM = CHANNEL_DIR_RX.exec(name);
  if (chanM) {
    return {
      kind: "channel",
      root: chanM[1],
      dir: chanM[2],
      part: chanM[3] as "channel" | "messages"
    };
  }
  const indexM = INDEX_JSON_RX.exec(name);
  if (indexM) {
    return {
      kind: "messages-index",
      root: indexM[1]
    };
  }
  if (ACTIVITY_RX.test(name)) {
    return {
      kind: "activity",
      name
    };
  }
  return {
    kind: "skip"
  };
}
interface ActivityScanner {
  feed(chunk: Uint8Array, final: boolean): void;
  records(): number;
}
function makeActivityScanner(ownerId: string, out: Map<string, string>): ActivityScanner {
  const decoder = new TextDecoder("utf-8", {
    fatal: false
  });
  let buffer = "";
  let mode: "unknown" | "ndjson" | "array" = "unknown";
  let depth = 0;
  let inString = false;
  let escape = false;
  let objStart = -1;
  let count = 0;
  function tryExtract(text: string): void {
    try {
      extractMessageId(JSON.parse(text), ownerId, out);
      count++;
    } catch {}
  }
  function feedNdjson(final: boolean): void {
    let start = 0;
    for (let i = 0; i < buffer.length; i++) {
      if (buffer.charCodeAt(i) === 10) {
        const line = buffer.slice(start, i).trim();
        if (line) tryExtract(line);
        start = i + 1;
      }
    }
    buffer = buffer.slice(start);
    if (final && buffer.trim()) {
      tryExtract(buffer.trim());
      buffer = "";
    }
  }
  function feedArray(): void {
    for (let i = 0; i < buffer.length; i++) {
      const c = buffer.charCodeAt(i);
      if (inString) {
        if (escape) {
          escape = false;
          continue;
        }
        if (c === 92) {
          escape = true;
          continue;
        }
        if (c === 34) inString = false;
        continue;
      }
      if (c === 34) {
        inString = true;
        continue;
      }
      if (c === 123) {
        if (depth === 0) objStart = i;
        depth++;
      } else if (c === 125) {
        depth--;
        if (depth === 0 && objStart >= 0) {
          tryExtract(buffer.slice(objStart, i + 1));
          objStart = -1;
        }
      }
    }
    if (objStart >= 0) {
      buffer = buffer.slice(objStart);
      objStart = -1;
      depth = 0;
      inString = false;
      escape = false;
    } else {
      buffer = "";
    }
  }
  return {
    feed(chunk, final) {
      if (chunk.byteLength > 0) {
        buffer += decoder.decode(chunk, {
          stream: !final
        });
      } else if (final) {
        buffer += decoder.decode();
      }
      if (mode === "unknown") {
        const trimStart = buffer.search(/\S/);
        if (trimStart < 0) {
          if (final) buffer = "";
          return;
        }
        if (buffer.charCodeAt(trimStart) === 91) {
          mode = "array";
          buffer = buffer.slice(trimStart + 1);
        } else {
          mode = "ndjson";
        }
      }
      if (mode === "ndjson") feedNdjson(final);else feedArray();
    },
    records() {
      return count;
    }
  };
}
interface MessageScanner {
  feed(chunk: Uint8Array, final: boolean): void;
  messages(): Message[];
}
function makeMessageScanner(): MessageScanner {
  const decoder = new TextDecoder("utf-8", {
    fatal: false
  });
  let buffer = "";
  let started = false;
  let depth = 0;
  let inString = false;
  let escape = false;
  let objStart = -1;
  const out: Message[] = [];
  function tryExtract(text: string): void {
    try {
      const raw = JSON.parse(text) as RawMessage;
      out.push(normalizeMessage(raw));
    } catch {}
  }
  function scan(): void {
    for (let i = 0; i < buffer.length; i++) {
      const c = buffer.charCodeAt(i);
      if (inString) {
        if (escape) {
          escape = false;
          continue;
        }
        if (c === 92) {
          escape = true;
          continue;
        }
        if (c === 34) inString = false;
        continue;
      }
      if (c === 34) {
        inString = true;
        continue;
      }
      if (c === 123) {
        if (depth === 0) objStart = i;
        depth++;
      } else if (c === 125) {
        depth--;
        if (depth === 0 && objStart >= 0) {
          tryExtract(buffer.slice(objStart, i + 1));
          objStart = -1;
        }
      }
    }
    if (objStart >= 0) {
      buffer = buffer.slice(objStart);
      objStart = -1;
      depth = 0;
      inString = false;
      escape = false;
    } else {
      buffer = "";
    }
  }
  return {
    feed(chunk, final) {
      if (chunk.byteLength > 0) {
        buffer += decoder.decode(chunk, {
          stream: !final
        });
      } else if (final) {
        buffer += decoder.decode();
      }
      if (!started) {
        const trimStart = buffer.search(/\S/);
        if (trimStart < 0) {
          if (final) buffer = "";
          return;
        }
        if (buffer.charCodeAt(trimStart) !== 91) {
          if (final) buffer = "";
          return;
        }
        started = true;
        buffer = buffer.slice(trimStart + 1);
      }
      scan();
    },
    messages() {
      return out;
    }
  };
}
interface SmallFiles {
  user?: Uint8Array;
  avatar?: Uint8Array;
  index?: Uint8Array;
}
interface ChannelPair {
  channel?: Uint8Array;
}
// Data is collected per candidate root while the ZIP is read, and a single
// root is picked deterministically only after the full archive has been
// seen — see selectAccountRoot/selectMessagesRoot in runIngest.
interface AccountRootCandidate {
  user?: Uint8Array;
  avatar?: Uint8Array;
}
interface MessagesRootCandidate {
  index?: Uint8Array;
  channelPairs: Map<string, ChannelPair>;
  messagesByDir: Map<string, Message[]>;
}
function bufferStream(stream: UnzipFile, onDone: (buf: Uint8Array) => void, onError: (e: Error) => void): void {
  const chunks: Uint8Array[] = [];
  let size = 0;
  stream.ondata = (err, chunk, final) => {
    if (err) {
      onError(err);
      return;
    }
    if (chunk && chunk.byteLength > 0) {
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
function post(msg: WorkerOutbound): void {
  self.postMessage(msg);
}
async function runIngest(file: File): Promise<void> {
  const small: SmallFiles = {};
  const accountCandidates = new Map<string, AccountRootCandidate>();
  const messagesCandidates = new Map<string, MessagesRootCandidate>();
  function getAccountCandidate(root: string): AccountRootCandidate {
    let c = accountCandidates.get(root);
    if (!c) {
      c = {};
      accountCandidates.set(root, c);
    }
    return c;
  }
  function getMessagesCandidate(root: string): MessagesRootCandidate {
    let c = messagesCandidates.get(root);
    if (!c) {
      c = {
        channelPairs: new Map(),
        messagesByDir: new Map()
      };
      messagesCandidates.set(root, c);
    }
    return c;
  }
  const authorByMessageId = new Map<string, string>();
  let ownerIdEarly: string | null = null;
  const activityScanners = new Map<string, ActivityScanner>();
  function getOrCreateScanner(name: string, ownerId: string): ActivityScanner {
    let s = activityScanners.get(name);
    if (!s) {
      s = makeActivityScanner(ownerId, authorByMessageId);
      activityScanners.set(name, s);
    }
    return s;
  }
  function resolveOwnerIfPossible(): void {
    if (ownerIdEarly || !small.user) return;
    try {
      const u = JSON.parse(TEXT.decode(small.user)) as {
        id?: string;
      };
      if (u.id) ownerIdEarly = u.id;
    } catch {}
  }
  let abortReason: Error | null = null;
  const ABORT = (e: Error): void => {
    if (!abortReason) abortReason = e;
  };
  const total = file.size;
  let bytesRead = 0;
  const totalGB = (total / 1e9).toFixed(2);
  const startedAt = performance.now();
  let lastTick = 0;
  post({
    type: "progress",
    progress: {
      phase: "extracting",
      pct: 0,
      detail: `0.00 / ${totalGB} GB · estimating…`
    }
  });
  const unzipper = new Unzip((stream: UnzipFile) => {
    const klass = classifyEntry(stream.name);
    if (klass.kind === "skip") return;
    if (klass.kind === "account-file") {
      bufferStream(stream, buf => {
        const cand = getAccountCandidate(klass.root);
        if (klass.file === "user") {
          if (!cand.user) cand.user = buf;
        } else if (!cand.avatar) {
          cand.avatar = buf;
        }
      }, ABORT);
      return;
    }
    if (klass.kind === "messages-index") {
      bufferStream(stream, buf => {
        const cand = getMessagesCandidate(klass.root);
        if (!cand.index) cand.index = buf;
      }, ABORT);
      return;
    }
    if (klass.kind === "channel") {
      const cand = getMessagesCandidate(klass.root);
      const pair = cand.channelPairs.get(klass.dir) ?? {};
      cand.channelPairs.set(klass.dir, pair);
      if (klass.part === "channel") {
        bufferStream(stream, buf => {
          pair.channel = buf;
        }, ABORT);
        return;
      }
      const scanner = makeMessageScanner();
      stream.ondata = (err, chunk, final) => {
        if (err) {
          ABORT(err);
          return;
        }
        scanner.feed(chunk ?? new Uint8Array(0), !!final);
        if (final) {
          cand.messagesByDir.set(klass.dir, scanner.messages());
        }
      };
      stream.start();
      return;
    }
    if (klass.kind === "activity") {
      const stashed: Uint8Array[] = [];
      let scanner: ActivityScanner | null = null;
      const flush = (chunk: Uint8Array, final: boolean): void => {
        if (!scanner && ownerIdEarly) {
          scanner = getOrCreateScanner(klass.name, ownerIdEarly);
          for (const s of stashed) scanner.feed(s, false);
          stashed.length = 0;
        }
        if (scanner) {
          scanner.feed(chunk, final);
        } else if (chunk.byteLength > 0) {
          stashed.push(chunk);
        }
      };
      stream.ondata = (err, chunk, final) => {
        if (err) {
          ABORT(err);
          return;
        }
        flush(chunk ?? new Uint8Array(0), !!final);
        if (final && !scanner && stashed.length > 0) {
          stashed.length = 0;
        }
      };
      stream.start();
      return;
    }
  });
  unzipper.register(AsyncUnzipInflate);
  unzipper.register(UnzipInflate);
  const reader = file.stream().getReader();
  try {
    while (true) {
      if (abortReason) throw abortReason;
      const {
        done,
        value
      } = await reader.read();
      if (done) {
        unzipper.push(new Uint8Array(0), true);
        break;
      }
      bytesRead += value.byteLength;
      unzipper.push(value, false);
      const now = performance.now();
      if (now - lastTick > 150 || bytesRead === value.byteLength) {
        lastTick = now;
        const pct = Math.min(82, Math.floor(bytesRead / total * 82));
        const elapsed = (now - startedAt) / 1000;
        const rate = elapsed > 0.3 ? bytesRead / elapsed : 0;
        const etaText = rate > 0 ? ` · ${fmtETA((total - bytesRead) / rate)} left` : " · estimating…";
        post({
          type: "progress",
          progress: {
            phase: "extracting",
            pct,
            detail: `${(bytesRead / 1e9).toFixed(2)} / ${totalGB} GB${etaText}`
          }
        });
      }
    }
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
  if (abortReason) throw abortReason;
  post({
    type: "progress",
    progress: {
      phase: "reading-account",
      pct: 84
    }
  });
  // Deterministic, order-independent root selection: pick a single account
  // root and a single messages root from everything collected above, then
  // only ever read files that belong to those exact roots. The literal
  // English "Account"/"Messages" roots always win when present, regardless
  // of what else was seen or in what order.
  function hasCredibleMessagesRoot(): boolean {
    for (const c of messagesCandidates.values()) {
      if (c.channelPairs.size > 0) return true;
    }
    return false;
  }
  function selectAccountRoot(): string {
    const historical = accountCandidates.get("Account");
    if (historical?.user) return "Account";
    // A user.json under a non-historical (localized) root is a much weaker
    // signal on its own than "Account/user.json" — a path shape match alone
    // could be any unrelated ZIP. Only trust it once the archive also has a
    // credible messages root (real channel folders), which a genuine
    // Discord export always has alongside its account data.
    if (!hasCredibleMessagesRoot()) {
      throw new Error("This doesn't look like a Discord export (no user.json found).");
    }
    const withUser = [...accountCandidates.entries()].filter(([, c]) => c.user).map(([root]) => root);
    if (withUser.length === 0) {
      throw new Error("This doesn't look like a Discord export (no user.json found).");
    }
    if (withUser.length > 1) {
      throw new Error(`Found multiple candidate account folders (${withUser.join(", ")}) — can't tell which one holds your Discord account data.`);
    }
    return withUser[0];
  }
  function selectMessagesRoot(): string | null {
    const historical = messagesCandidates.get("Messages");
    if (historical && historical.channelPairs.size > 0) return "Messages";
    const withChannels = [...messagesCandidates.entries()].filter(([root, c]) => root !== "Messages" && c.channelPairs.size > 0).map(([root]) => root);
    if (withChannels.length === 1) return withChannels[0];
    if (withChannels.length > 1) {
      throw new Error(`Found multiple candidate message folders (${withChannels.join(", ")}) — can't tell which one holds your Discord messages.`);
    }
    // Nobody has channel data. Preserve historical behavior: if a literal
    // "Messages" folder exists at all (e.g. just an index.json so far),
    // still resolve to it so that index.json can load.
    if (historical) return "Messages";
    return null;
  }
  const accountRoot = selectAccountRoot();
  const accountCand = accountCandidates.get(accountRoot)!;
  small.user = accountCand.user;
  small.avatar = accountCand.avatar;
  resolveOwnerIfPossible();
  const messagesRoot = selectMessagesRoot();
  const messagesCand = messagesRoot ? messagesCandidates.get(messagesRoot) : undefined;
  small.index = messagesCand?.index;
  const channelPairs = messagesCand?.channelPairs ?? new Map<string, ChannelPair>();
  const messagesByDir = messagesCand?.messagesByDir ?? new Map<string, Message[]>();
  if (!small.user) {
    throw new Error("This doesn't look like a Discord export (no user.json found).");
  }
  let userJson: {
    id?: string;
    username?: string;
    created_at?: string;
  };
  try {
    userJson = JSON.parse(TEXT.decode(small.user)) as typeof userJson;
  } catch {
    throw new Error("user.json is malformed");
  }
  const ownerId = userJson.id ?? "unknown";
  const ownerUsername = userJson.username ?? "unknown";
  let ownerCreatedAt: number | null = null;
  if (userJson.created_at) {
    const t = Date.parse(userJson.created_at);
    if (!Number.isNaN(t)) ownerCreatedAt = t;
  }
  if (ownerCreatedAt == null && ownerId !== "unknown" && /^\d+$/.test(ownerId)) {
    try {
      ownerCreatedAt = Number((BigInt(ownerId) >> 22n) + 1420070400000n);
    } catch {}
  }
  let ownerAvatarBlob: Blob | null = null;
  if (small.avatar) {
    ownerAvatarBlob = new Blob([small.avatar.slice().buffer], {
      type: "image/jpeg"
    });
  }
  const ownerAvatarUrl = getDefaultAvatarUrl(ownerId);
  const messagesIndex: Record<string, string> = small.index ? JSON.parse(TEXT.decode(small.index)) as Record<string, string> : {};
  small.user = undefined;
  small.avatar = undefined;
  small.index = undefined;
  const summaries: ConversationSummary[] = [];
  const dirs = [...channelPairs.keys()];
  let i = 0;
  let lastYield = performance.now();
  for (const dir of dirs) {
    i++;
    const pair = channelPairs.get(dir);
    channelPairs.delete(dir);
    const streamed = messagesByDir.get(dir);
    messagesByDir.delete(dir);
    if (!pair || !pair.channel || !streamed) {
      if (import.meta.env.DEV) {
        console.warn(`[ingest] incomplete channel pair for dir ${dir}: ` + `channel=${!!pair?.channel} messages=${!!streamed}. Skipping.`);
      }
      continue;
    }
    let raw: RawChannel;
    try {
      raw = JSON.parse(TEXT.decode(pair.channel)) as RawChannel;
    } catch {
      continue;
    }
    if (raw.type !== "DM" && raw.type !== "GROUP_DM" && raw.type !== "GUILD_TEXT") continue;
    pair.channel = undefined;
    const messages = streamed.sort((a, b) => a.timestamp - b.timestamp);
    const kind: ConversationKind = raw.type === "DM" ? "dm" : raw.type === "GROUP_DM" ? "group" : "server";
    const displayName = getDisplayName(raw, messagesIndex);
    for (const msg of messages) msg.authorId = ownerId;
    const participants: Participant[] = kind === "server" ? buildServerParticipants(messages, ownerId, ownerUsername, ownerAvatarUrl) : buildParticipants(raw, displayName, ownerId, ownerUsername, ownerAvatarUrl);
    summaries.push({
      id: raw.id,
      kind,
      displayName,
      participants,
      messageCount: messages.length,
      firstTs: messages[0]?.timestamp ?? null,
      lastTs: messages[messages.length - 1]?.timestamp ?? null,
      serverId: kind === "server" ? (raw as {
        guild?: {
          id: string;
        };
      }).guild?.id : undefined,
      serverName: kind === "server" ? resolveServerName(raw, messagesIndex) : undefined
    });
    post({
      type: "channel",
      channelId: raw.id,
      messages
    });
    if (i % 4 === 0 || i === dirs.length) {
      const phase: Phase = "reading-channels";
      post({
        type: "progress",
        progress: {
          phase,
          pct: 85 + Math.floor(i / dirs.length * 14),
          detail: `${i} / ${dirs.length}`
        }
      });
    }
    if (performance.now() - lastYield > 16) {
      await new Promise(r => setTimeout(r, 0));
      lastYield = performance.now();
    }
  }
  summaries.sort((a, b) => (b.lastTs ?? 0) - (a.lastTs ?? 0));
  post({
    type: "progress",
    progress: {
      phase: "done",
      pct: 100
    }
  });
  const manifest: Omit<Manifest, "ownerAvatarPath"> = {
    ownerUserId: ownerId,
    ownerDisplayName: ownerUsername,
    ownerCreatedAt,
    conversations: summaries
  };
  post({
    type: "done",
    manifest,
    ownerAvatarBlob
  });
}
self.onmessage = (ev: MessageEvent<WorkerInbound>) => {
  const msg = ev.data;
  if (msg.type !== "ingest") return;
  runIngest(msg.file).catch((e: unknown) => {
    const message = e instanceof Error ? e.message : String(e);
    post({
      type: "error",
      message
    });
  });
};
