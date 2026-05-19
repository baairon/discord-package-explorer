import { memo, useCallback, useMemo, useState } from "react";
import { formatRelative, formatShortDateTime } from "../lib/datetime";
import { getAttachments } from "../lib/attachments";
import { renderCensored } from "../lib/censor";
import type { Attachment, Manifest, Message, Participant } from "../ingest/types";
const MENTION_RX = /<@!?(\d+)>/g;
const URL_RX = /(https?:\/\/[^\s]+)/g;
interface MessageRowProps {
  message: Message;
  participants: Participant[];
  manifest: Manifest;
  highlight?: boolean;
  highlightQuery?: string;
  onOpenAttachment?: (url: string) => void;
}
export const MessageRow = memo(function MessageRow({
  message,
  participants,
  manifest,
  highlight,
  highlightQuery,
  onOpenAttachment
}: MessageRowProps) {
  const ownerId = manifest.ownerUserId;
  const ownerName = manifest.ownerDisplayName;
  const ownerAvatar = manifest.ownerAvatarPath;
  const {
    byId,
    owner
  } = useMemo(() => {
    const byId = new Map<string, Participant>();
    let owner: Participant | undefined;
    for (const p of participants) {
      byId.set(p.id, p);
      if (p.isOwner) owner = p;
    }
    return {
      byId,
      owner
    };
  }, [participants]);
  const matched = message.authorId ? byId.get(message.authorId) : undefined;
  const author = matched ?? owner;
  const isOwner = author?.isOwner ?? true;
  const label = isOwner ? ownerName : author?.username ?? author?.id ?? ownerName;
  const avatarUrl = isOwner ? ownerAvatar ?? author?.avatarUrl : author?.avatarUrl ?? ownerAvatar;
  const [avatarFailed, setAvatarFailed] = useState(false);
  const lookupName = useCallback((id: string) => {
    if (id === ownerId) return "You";
    return byId.get(id)?.username ?? id;
  }, [byId, ownerId]);
  const renderedContent = useMemo(() => message.contents ? renderContents(message.contents, lookupName, highlightQuery) : null, [message.contents, lookupName, highlightQuery]);
  return <div className={highlight ? "msg highlight" : "msg"}>
      {avatarUrl && !avatarFailed ? <img className="msg-avatar" src={avatarUrl} alt="" referrerPolicy="no-referrer" onError={() => setAvatarFailed(true)} /> : ownerAvatar ? <img className="msg-avatar" src={ownerAvatar} alt="" /> : <div className="msg-avatar" />}
      <div className="msg-body">
        <div className="msg-meta">
          <span className="msg-author">{isOwner ? ownerName : renderCensored(label)}</span>
          <span className="msg-ts" title={formatShortDateTime(message.timestamp)}>
            {formatShortDateTime(message.timestamp)}
          </span>
          <span className="msg-rel">{formatRelative(message.timestamp)}</span>
        </div>
        {renderedContent && <div className="msg-content">{renderedContent}</div>}
        {(() => {
        const atts = getAttachments(message);
        if (atts.length === 0) return null;
        return <div className="msg-attachments">
              {atts.map((a, i) => <AttachmentView key={i} attachment={a} onOpen={onOpenAttachment} />)}
            </div>;
      })()}
      </div>
    </div>;
});
function renderContents(text: string, lookupName: (id: string) => string, highlightQuery?: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let key = 0;
  const mentionMatches = [...text.matchAll(MENTION_RX)];
  let cursor = 0;
  const segments: Array<{
    kind: "text" | "mention";
    value: string;
  }> = [];
  for (const m of mentionMatches) {
    const idx = m.index ?? 0;
    if (idx > cursor) segments.push({
      kind: "text",
      value: text.slice(cursor, idx)
    });
    segments.push({
      kind: "mention",
      value: m[1]
    });
    cursor = idx + m[0].length;
  }
  if (cursor < text.length) segments.push({
    kind: "text",
    value: text.slice(cursor)
  });
  for (const seg of segments) {
    if (seg.kind === "mention") {
      out.push(<span key={key++} className="mention">
          @{lookupName(seg.value)}
        </span>);
      continue;
    }
    const parts = seg.value.split(URL_RX);
    for (const p of parts) {
      if (!p) continue;
      if (/^https?:\/\//.test(p)) {
        out.push(<a key={key++} href={p} target="_blank" rel="noreferrer" className="msg-link">
            {p}
          </a>);
      } else {
        out.push(...highlightSplit(p, highlightQuery, () => key++));
      }
    }
  }
  return out;
}
function highlightSplit(text: string, query: string | undefined, nextKey: () => number): React.ReactNode[] {
  if (!query || query.length < 2) return [<span key={nextKey()}>{renderCensored(text)}</span>];
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(q, i);
    if (idx < 0) {
      out.push(<span key={nextKey()}>{renderCensored(text.slice(i))}</span>);
      break;
    }
    if (idx > i) out.push(<span key={nextKey()}>{renderCensored(text.slice(i, idx))}</span>);
    out.push(<mark key={nextKey()}>{text.slice(idx, idx + q.length)}</mark>);
    i = idx + q.length;
  }
  return out;
}
function AttachmentView({
  attachment,
  onOpen
}: {
  attachment: Attachment;
  onOpen?: (url: string) => void;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <a href={attachment.url} target="_blank" rel="noreferrer" className="msg-link">
        {attachment.filename}
      </a>;
  }
  if (attachment.kind === "image") {
    return <button type="button" className="msg-attachment-trigger" onClick={() => onOpen?.(attachment.url)} aria-label={`Open ${attachment.filename}`}>
        <img src={attachment.url} alt={attachment.filename} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      </button>;
  }
  if (attachment.kind === "video") {
    return <button type="button" className="msg-attachment-trigger msg-attachment-video" onClick={() => onOpen?.(attachment.url)} aria-label={`Open ${attachment.filename}`}>
        <video src={attachment.url} preload="metadata" muted playsInline crossOrigin="anonymous" onError={() => setFailed(true)} />
      </button>;
  }
  if (attachment.kind === "audio") {
    return <audio controls preload="metadata" onError={() => setFailed(true)}>
        <source src={attachment.url} />
      </audio>;
  }
  return <a href={attachment.url} target="_blank" rel="noreferrer" className="msg-link">
      {attachment.filename}
    </a>;
}
