import type { Stats } from "./stats";

type Generator = (s: Stats) => string | null;

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function fmt(n: number): string {
  return n.toLocaleString();
}

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  if (h < 12) return `${h}am`;
  return `${h - 12}pm`;
}

function peakIndex(arr: number[]): number {
  let best = -1;
  let bestVal = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > bestVal) { bestVal = arr[i]; best = i; }
  }
  return best;
}

function busiestYear(stats: Stats): { year: number; count: number } | null {
  let bestYear = -1;
  let bestCount = 0;
  for (const [y, c] of Object.entries(stats.messagesByYear)) {
    if (c > bestCount) { bestCount = c; bestYear = Number(y); }
  }
  return bestYear > 0 ? { year: bestYear, count: bestCount } : null;
}

function busiestDayCount(stats: Stats): number {
  let max = 0;
  for (const v of stats.dailyCounts.values()) if (v > max) max = v;
  return max;
}

const GENERATORS: Generator[] = [
  (s) => {
    const h = peakIndex(s.hourHistogram);
    if (h < 0 || s.hourHistogram[h] === 0) return null;
    return `Your peak hour was ${formatHour(h)}. You sent ${fmt(s.hourHistogram[h])} messages then`;
  },
  (s) => {
    if (s.totalMessages === 0) return null;
    const lateNight = s.hourHistogram[0] + s.hourHistogram[1] + s.hourHistogram[2] + s.hourHistogram[3] + s.hourHistogram[4];
    const pct = Math.round((lateNight / s.totalMessages) * 100);
    return pct >= 1 ? `${pct}% of your messages happened past midnight` : null;
  },
  (s) => {
    if (s.totalMessages === 0) return null;
    let evening = 0;
    for (let i = 18; i < 24; i++) evening += s.hourHistogram[i];
    const pct = Math.round((evening / s.totalMessages) * 100);
    return pct >= 10 ? `${pct}% of your messages came after 6pm` : null;
  },
  (s) => {
    if (s.totalMessages === 0) return null;
    let morning = 0;
    for (let i = 5; i < 12; i++) morning += s.hourHistogram[i];
    const pct = Math.round((morning / s.totalMessages) * 100);
    return pct >= 10 ? `${pct}% of your messages were sent before noon` : null;
  },
  (s) => {
    const max = busiestDayCount(s);
    return max > 0 ? `Your busiest day had ${fmt(max)} messages in 24 hours` : null;
  },
  (s) => (s.longestGapDays >= 14 ? `Your longest silence between messages was ${fmt(s.longestGapDays)} days` : null),
  (s) => {
    const best = busiestYear(s);
    return best ? `${best.year} was your loudest year with ${fmt(best.count)} messages` : null;
  },
  (s) => {
    if (s.firstTs === null) return null;
    const years = Math.floor((Date.now() - s.firstTs) / YEAR_MS);
    return years >= 1 ? `Your first message was ${fmt(years)} years ago` : null;
  },
  (s) => {
    if (s.activeDays <= 0) return null;
    const avg = Math.round(s.totalMessages / s.activeDays);
    return avg >= 1 ? `You averaged ${fmt(avg)} messages on the days you talked` : null;
  },
  (s) => {
    if (s.totalMessages === 0) return null;
    const avg = Math.round(s.totalCharacters / s.totalMessages);
    return avg >= 1 ? `Your average message was ${fmt(avg)} characters` : null;
  },
  (s) => (s.longestMessageLen >= 100 ? `Your longest message was ${fmt(s.longestMessageLen)} characters` : null),
  (s) => (s.oneWordCount >= 50 ? `You sent ${fmt(s.oneWordCount)} one-word messages` : null),
  (s) => (s.yelledCount >= 5 ? `You yelled in all-caps ${fmt(s.yelledCount)} times` : null),
  (s) => (s.questionCount >= 100 ? `You asked ${fmt(s.questionCount)} questions` : null),
  (s) => (s.activeDays >= 30 ? `You've been active on ${fmt(s.activeDays)} different days` : null),
  (s) => {
    if (s.totalMessages === 0 || s.topConversations.length === 0) return null;
    const top = s.topConversations[0].count;
    const pct = Math.round((top / s.totalMessages) * 100);
    return pct >= 10 ? `${pct}% of your messages went to one chat` : null;
  },
  (s) => {
    if (s.firstTs === null || s.lastTs === null) return null;
    const years = (s.lastTs - s.firstTs) / YEAR_MS;
    return years >= 1 ? `Your messages span ${fmt(Math.round(years))} years` : null;
  },
  (s) => {
    const idx = peakIndex(s.weekdayCounts);
    if (idx < 0 || s.weekdayCounts[idx] === 0) return null;
    return `${WEEKDAY_NAMES[idx]} is your most talkative day`;
  },
  (s) => {
    const idx = peakIndex(s.monthCounts);
    if (idx < 0 || s.monthCounts[idx] === 0) return null;
    return `${MONTH_NAMES[idx]} is your loudest month of the year`;
  },
  (s) => {
    if (s.totalMessages === 0) return null;
    const pct = Math.round((s.weekendCount / s.totalMessages) * 100);
    return pct >= 10 ? `${pct}% of your messages were sent on weekends` : null;
  },
  (s) => {
    const hours = Math.round(s.totalCharacters / 12000);
    return hours >= 5 ? `Roughly ${fmt(hours)} hours of your life have gone into typing on Discord` : null;
  },
  (s) => {
    if (s.lastTs === null) return null;
    const days = Math.floor((Date.now() - s.lastTs) / DAY_MS);
    return days >= 30 ? `It's been ${fmt(days)} days since your last message in this export` : null;
  },
  (s) => {
    if (s.totalMessages < 100) return null;
    const dmPct = Math.round((s.messagesByKind.dm / s.totalMessages) * 100);
    const serverPct = Math.round((s.messagesByKind.server / s.totalMessages) * 100);
    if (dmPct >= 25 && dmPct >= serverPct) return `${dmPct}% of your messages were sent in DMs`;
    if (serverPct >= 25) return `${serverPct}% of your messages were sent in servers`;
    return null;
  },
  (s) => {
    const currentYear = new Date().getFullYear();
    const n = s.messagesByYear[currentYear] ?? 0;
    return n >= 50 ? `You've sent ${fmt(n)} messages so far this year` : null;
  },
  (s) => (s.conversationCount >= 5 ? `You're chatting in ${fmt(s.conversationCount)} different conversations` : null)
];

export function pickFunFact(stats: Stats): string | null {
  const candidates: string[] = [];
  for (const gen of GENERATORS) {
    const text = gen(stats);
    if (text !== null) candidates.push(text);
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
