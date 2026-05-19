import type { Attachment, AttachmentKind, Message } from "../ingest/types";
const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "avif"]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov", "m4v", "ogv", "mkv", "avi"]);
const AUDIO_EXT = new Set(["mp3", "wav", "ogg", "m4a", "flac", "aac", "opus"]);
function classify(ext: string): AttachmentKind {
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  if (AUDIO_EXT.has(ext)) return "audio";
  return "other";
}
const EMPTY: Attachment[] = [];
const cache = new WeakMap<Message, Attachment[]>();
export function getAttachments(message: Message): Attachment[] {
  const hit = cache.get(message);
  if (hit) return hit;
  const raw = message.attachmentsRaw;
  if (!raw) {
    cache.set(message, EMPTY);
    return EMPTY;
  }
  const out: Attachment[] = [];
  for (const url of raw.split(/\s+/)) {
    if (!url || !/^https?:\/\//i.test(url)) continue;
    const noQuery = url.split("?")[0];
    const filename = noQuery.split("/").pop() ?? url;
    const ext = filename.toLowerCase().split(".").pop() ?? "";
    const kind = classify(ext);
    out.push({
      url,
      filename,
      isImage: kind === "image",
      kind
    });
  }
  const result = out.length === 0 ? EMPTY : out;
  cache.set(message, result);
  return result;
}
