import { useDeferredValue, useMemo } from "react";
import type { ConversationSummary, IngestResult, Message } from "../ingest/types";
export type SearchScope = "dm-all" | "dm-one" | "server-all" | "server-channel";
export interface SearchHit {
  messageId: string;
  timestamp: number;
  snippet: string;
}
export interface ResultGroup {
  conversationId: string;
  conversationName: string;
  kind: ConversationSummary["kind"];
  totalHits: number;
  hits: SearchHit[];
}
const HITS_PER_GROUP = 25;
const SNIPPET_CHARS = 40;
function buildSnippet(text: string, q: string): string {
  if (!q) return text.length > SNIPPET_CHARS * 2 ? text.slice(0, SNIPPET_CHARS * 2) + "…" : text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) return text.slice(0, SNIPPET_CHARS * 2);
  const start = Math.max(0, idx - SNIPPET_CHARS);
  const end = Math.min(text.length, idx + q.length + SNIPPET_CHARS);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return prefix + text.slice(start, end) + suffix;
}
function scanChannel(channelId: string, summary: ConversationSummary, messages: Message[] | undefined, needle: string, ownerOnly: boolean, ownerId: string): ResultGroup | null {
  if (!messages || messages.length === 0) return null;
  const hits: SearchHit[] = [];
  let total = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (ownerOnly && m.authorId && m.authorId !== ownerId) continue;
    if (!m.contents) continue;
    if (m.contents.toLowerCase().indexOf(needle) < 0) continue;
    total++;
    if (hits.length < HITS_PER_GROUP) {
      hits.push({
        messageId: m.id,
        timestamp: m.timestamp,
        snippet: buildSnippet(m.contents, needle)
      });
    }
  }
  if (total === 0) return null;
  return {
    conversationId: channelId,
    conversationName: summary.displayName,
    kind: summary.kind,
    totalHits: total,
    hits
  };
}
export function useSearchResults(data: IngestResult | null, rawQuery: string, scope: SearchScope, anchorId: string | null): ResultGroup[] {
  const deferred = useDeferredValue(rawQuery);
  return useMemo(() => {
    if (!data) return [];
    const needle = deferred.trim().toLowerCase();
    if (needle.length < 2) return [];
    const ownerId = data.manifest.ownerUserId;
    const byId = new Map<string, ConversationSummary>();
    for (const c of data.manifest.conversations) byId.set(c.id, c);
    const groups: ResultGroup[] = [];
    if (scope === "dm-one" || scope === "server-channel") {
      if (!anchorId) return [];
      const summary = byId.get(anchorId);
      if (!summary) return [];
      if (scope === "server-channel" && summary.kind !== "server") return [];
      const messages = data.messagesByChannel.get(anchorId);
      const ownerOnly = scope === "server-channel";
      const g = scanChannel(anchorId, summary, messages, needle, ownerOnly, ownerId);
      if (g) groups.push(g);
      return groups;
    }
    if (scope === "dm-all") {
      for (const [id, messages] of data.messagesByChannel) {
        const summary = byId.get(id);
        if (!summary || summary.kind === "server") continue;
        const g = scanChannel(id, summary, messages, needle, false, ownerId);
        if (g) groups.push(g);
      }
      groups.sort((a, b) => b.totalHits - a.totalHits);
      return groups;
    }
    if (scope === "server-all") {
      const anchorSummary = anchorId ? byId.get(anchorId) : null;
      const restrictToServerName = anchorSummary && anchorSummary.kind === "server" ? anchorSummary.serverName : null;
      for (const [id, messages] of data.messagesByChannel) {
        const summary = byId.get(id);
        if (!summary || summary.kind !== "server") continue;
        if (restrictToServerName !== null && summary.serverName !== restrictToServerName) continue;
        const g = scanChannel(id, summary, messages, needle, true, ownerId);
        if (g) groups.push(g);
      }
      groups.sort((a, b) => b.totalHits - a.totalHits);
      return groups;
    }
    return [];
  }, [data, deferred, scope, anchorId]);
}
