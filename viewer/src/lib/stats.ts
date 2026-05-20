import type { ConversationKind, ConversationSummary, IngestResult } from "../ingest/types";
export interface TopConversation {
  id: string;
  displayName: string;
  avatar: string | null;
  count: number;
  kind: ConversationSummary["kind"];
}
export interface FirstMessage {
  timestamp: number;
  channelId: string;
  messageId: string;
  preview: string;
  channelName: string;
  kind: ConversationKind;
}
export interface Stats {
  totalMessages: number;
  totalCharacters: number;
  activeDays: number;
  longestStreak: number;
  peopleTalkedTo: number;
  hourHistogram: number[];
  dailyCounts: Map<string, number>;
  topConversations: TopConversation[];
  firstTs: number | null;
  lastTs: number | null;
  firstMessage: FirstMessage | null;
  questionCount: number;
  yelledCount: number;
  longestMessageLen: number;
  oneWordCount: number;
  messagesByYear: Record<number, number>;
  weekdayCounts: number[];
  monthCounts: number[];
  weekendCount: number;
  longestGapDays: number;
  messagesByKind: { dm: number; group: number; server: number };
  conversationCount: number;
}
const DAY_MS = 24 * 60 * 60 * 1000;
function pickConversationAvatar(c: ConversationSummary): string | null {
  if (c.kind === "server") return null;
  const other = c.participants.find(p => !p.isOwner) ?? c.participants[0] ?? null;
  return other?.avatarUrl ?? null;
}
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function aggregateStats(data: IngestResult): Stats {
  const ownerId = data.manifest.ownerUserId;
  let totalMessages = 0;
  let totalCharacters = 0;
  let firstTs: number | null = null;
  let lastTs: number | null = null;
  const hourHistogram = new Array<number>(24).fill(0);
  const dailyCounts = new Map<string, number>();
  const ownerDayKeys = new Set<string>();
  const ownerCountByChannel = new Map<string, number>();
  const peopleSet = new Set<string>();
  let firstMessage: FirstMessage | null = null;
  let questionCount = 0;
  let yelledCount = 0;
  let longestMessageLen = 0;
  let oneWordCount = 0;
  const messagesByYear: Record<number, number> = {};
  const weekdayCounts = new Array<number>(7).fill(0);
  const monthCounts = new Array<number>(12).fill(0);
  let weekendCount = 0;
  const messagesByKind = { dm: 0, group: 0, server: 0 };
  const byId = new Map<string, ConversationSummary>();
  for (const c of data.manifest.conversations) byId.set(c.id, c);
  for (const c of data.manifest.conversations) {
    if (c.kind === "server") continue;
    for (const p of c.participants) {
      if (!p.isOwner && p.id !== ownerId) peopleSet.add(p.id);
    }
  }
  for (const [channelId, messages] of data.messagesByChannel) {
    const summary = byId.get(channelId);
    if (!summary) continue;
    let ownerCount = 0;
    for (const m of messages) {
      const ts = m.timestamp;
      if (!ts) continue;
      const d = new Date(ts);
      const key = dayKey(d);
      dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
      if (m.authorId !== ownerId) continue;
      totalMessages++;
      ownerCount++;
      const content = m.contents;
      const len = content.length;
      totalCharacters += len;
      if (len > longestMessageLen) longestMessageLen = len;
      if (firstTs === null || ts < firstTs) firstTs = ts;
      if (lastTs === null || ts > lastTs) lastTs = ts;
      if (firstMessage === null || ts < firstMessage.timestamp) {
        firstMessage = {
          timestamp: ts,
          channelId,
          messageId: m.id,
          preview: content.slice(0, 80),
          channelName: summary.displayName,
          kind: summary.kind
        };
      }
      hourHistogram[d.getHours()]++;
      ownerDayKeys.add(key);
      const year = d.getFullYear();
      messagesByYear[year] = (messagesByYear[year] ?? 0) + 1;
      const weekday = d.getDay();
      weekdayCounts[weekday]++;
      monthCounts[d.getMonth()]++;
      if (weekday === 0 || weekday === 6) weekendCount++;
      if (summary.kind === "dm") messagesByKind.dm++;
      else if (summary.kind === "group") messagesByKind.group++;
      else messagesByKind.server++;
      if (len > 0) {
        for (let i = 0; i < len; i++) {
          if (content.charCodeAt(i) === 63) questionCount++;
        }
        if (len >= 5 && content === content.toUpperCase() && /[A-Z]/.test(content)) {
          yelledCount++;
        }
        const trimmed = content.trim();
        if (trimmed.length > 0 && trimmed.length <= 30 && !/\s/.test(trimmed)) {
          oneWordCount++;
        }
      }
    }
    if (ownerCount > 0) ownerCountByChannel.set(channelId, ownerCount);
  }
  const topConversations: TopConversation[] = [];
  for (const [id, count] of ownerCountByChannel) {
    const summary = byId.get(id);
    if (!summary) continue;
    if (summary.kind === "server") continue;
    topConversations.push({
      id,
      displayName: summary.displayName,
      avatar: pickConversationAvatar(summary),
      count,
      kind: summary.kind
    });
  }
  topConversations.sort((a, b) => b.count - a.count);
  topConversations.length = Math.min(topConversations.length, 10);
  const activeDays = ownerDayKeys.size;
  let longestStreak = 0;
  let longestGapDays = 0;
  if (activeDays > 0) {
    const sortedDays = Array.from(ownerDayKeys).map(k => {
      const [y, m, d] = k.split("-").map(Number);
      return Date.UTC(y, m - 1, d);
    }).sort((a, b) => a - b);
    let run = 1;
    longestStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const diff = Math.round((sortedDays[i] - sortedDays[i - 1]) / DAY_MS);
      if (diff === 1) {
        run++;
        if (run > longestStreak) longestStreak = run;
      } else if (diff > 1) {
        run = 1;
        const gap = diff - 1;
        if (gap > longestGapDays) longestGapDays = gap;
      }
    }
  }
  if (import.meta.env.DEV) {
    let dcSum = 0;
    for (const v of dailyCounts.values()) dcSum += v;
    if (dcSum !== totalMessages) {
      console.warn(`[stats] invariant broken: dailyCounts sum (${dcSum}) !== totalMessages (${totalMessages}). ` + `Author attribution is inconsistent or ingest dropped messages.`);
    }
  }
  return {
    totalMessages,
    totalCharacters,
    activeDays,
    longestStreak,
    peopleTalkedTo: peopleSet.size,
    hourHistogram,
    dailyCounts,
    topConversations,
    firstTs,
    lastTs,
    firstMessage,
    questionCount,
    yelledCount,
    longestMessageLen,
    oneWordCount,
    messagesByYear,
    weekdayCounts,
    monthCounts,
    weekendCount,
    longestGapDays,
    messagesByKind,
    conversationCount: byId.size
  };
}
