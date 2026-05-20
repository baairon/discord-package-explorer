import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { IngestResult } from "../ingest/types";
import { type FirstMessage, type TopConversation } from "../lib/stats";
import { useStatsWorker } from "../lib/useStatsWorker";
import { formatShortDate } from "../lib/datetime";
import { ArrowLeftIcon, ChevronRightIcon, ShareIcon, TrophyIcon } from "./icons";
import { renderCensored } from "../lib/censor";
import { ShareCardModal } from "./ShareCardModal";
import type { ShareCardData } from "../lib/shareCard";
import { pickFunFact } from "../lib/funFacts";

interface StatsPageProps {
  data: IngestResult;
  onBack: () => void;
  onJumpToConversation: (id: string) => void;
  onJumpToMessage: (channelId: string, messageId: string) => void;
}

type CardVariant = "msg" | "streak" | "chars" | "people";

export function StatsPage({
  data,
  onBack,
  onJumpToConversation,
  onJumpToMessage
}: StatsPageProps) {
  const { stats } = useStatsWorker(data);
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareSeed, setShareSeed] = useState(0);
  const tagline = useMemo(() => stats ? pickFunFact(stats) : null, [stats, shareSeed]);
  const sparkline = useMemo(() => stats ? buildSparkline(stats.dailyCounts, 12) : [], [stats]);
  const peakDay = useMemo(() => stats ? peakDayOf(stats.dailyCounts) : null, [stats]);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);
  if (!stats) {
    return <div className={`pane stats-pane${open ? " open" : ""}`}>
        <div className="pane-header">
          <div className="pane-header-left">
            <button className="mobile-back" onClick={onBack} aria-label="Back">
              <ArrowLeftIcon />
            </button>
            <div>
              <div className="pane-title">Stats</div>
            </div>
          </div>
        </div>
        <div className="pane-empty pane-empty-conv">
          <div className="spinner" role="status" aria-label="Loading stats" />
        </div>
      </div>;
  }
  const range = stats.firstTs && stats.lastTs ? `Active ${formatShortDate(stats.firstTs)} – ${formatShortDate(stats.lastTs)}` : "No messages from you in this export";
  const peakHour = peakIndex(stats.hourHistogram);
  const shareData: ShareCardData = {
    ownerName: data.manifest.ownerDisplayName,
    ownerAvatarUrl: data.manifest.ownerAvatarPath ?? null,
    ownerCreatedAt: data.manifest.ownerCreatedAt,
    totalMessages: stats.totalMessages,
    totalCharacters: stats.totalCharacters,
    peopleTalkedTo: stats.peopleTalkedTo,
    longestStreak: stats.longestStreak,
    dailyCounts: stats.dailyCounts,
    tagline
  };
  return <div className={`pane stats-pane${open ? " open" : ""}`}>
      <div className="pane-header">
        <div className="pane-header-left">
          <button className="mobile-back" onClick={onBack} aria-label="Back">
            <ArrowLeftIcon />
          </button>
          <div>
            <div className="pane-title">Stats</div>
            <div className="pane-meta">{range}</div>
          </div>
        </div>
        <button type="button" className="stats-share-btn" onClick={() => { setShareSeed(s => s + 1); setShareOpen(true); }} aria-label="Share card">
          <ShareIcon />
          <span>Share Card</span>
        </button>
      </div>
      <div className="pane-body stats-body">
        <Hero name={data.manifest.ownerDisplayName} avatar={data.manifest.ownerAvatarPath} createdAt={data.manifest.ownerCreatedAt} />

        <StatCard variant="msg" label="Messages sent" value={stats.totalMessages} sparkline={sparkline} />
        <StatCard variant="streak" label="Best streak" value={stats.longestStreak} suffix="days" />
        <StatCard variant="chars" label="Characters" value={stats.totalCharacters} />
        <StatCard variant="people" label="People talked to" value={stats.peopleTalkedTo} />

        {stats.firstMessage && <Trophy first={stats.firstMessage} onJump={onJumpToMessage} />}

        {stats.dailyCounts.size > 0 && <Section areaClass="stats-section-timeline" title="Activity over time" subtitle={peakDay ? <>Peak <b>{peakDay.count.toLocaleString()}</b><span className="stats-peak-date"> on {formatShortDate(peakDay.ms)}</span></> : undefined}>
            <DailyTimeline dailyCounts={stats.dailyCounts} activeDays={stats.activeDays} />
          </Section>}

        <Section areaClass="stats-section-top" title="Top conversations" subtitle={stats.peopleTalkedTo > 0 ? <><b>{stats.peopleTalkedTo.toLocaleString()}</b> people</> : undefined}>
          {stats.topConversations.length === 0 ? <div className="stats-empty">No DM or group activity in this export.</div> : <div className="stats-tile stats-top-tile">
                <TopConversationsList rows={stats.topConversations} onJump={onJumpToConversation} />
              </div>}
        </Section>

        <Section areaClass="stats-section-hours" title="Hour of day" subtitle={peakHour !== null ? <>Peak at <b>{formatHour(peakHour)}</b></> : undefined}>
          <Histogram values={stats.hourHistogram} labels={hourLabels()} peakIndex={peakHour} />
        </Section>
      </div>
      <AnimatePresence>
        {shareOpen && <ShareCardModal key="share-card" data={shareData} onClose={() => setShareOpen(false)} />}
      </AnimatePresence>
    </div>;
}

function Hero({
  name,
  avatar,
  createdAt
}: {
  name: string;
  avatar?: string;
  createdAt: number | null;
}) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return <section className="stats-tile stats-hero">
      {avatar ? <img className="stats-hero-avatar" src={avatar} alt="" /> : <div className="stats-hero-avatar">{initial}</div>}
      <div className="stats-hero-name">{renderCensored(name)}</div>
      <div className="stats-hero-meta">
        {createdAt && <span>Joined {formatShortDate(createdAt)}</span>}
      </div>
    </section>;
}

function Trophy({
  first,
  onJump
}: {
  first: FirstMessage;
  onJump: (channelId: string, messageId: string) => void;
}) {
  const truncated = first.preview.length === 80;
  const channelNode = first.kind === "server" ? <>#{renderCensored(first.channelName)}</> : renderCensored(first.channelName);
  return <button type="button" className="stats-trophy" onClick={() => onJump(first.channelId, first.messageId)}>
      <span className="stats-trophy-icon">
        <TrophyIcon />
      </span>
      <span className="stats-trophy-body">
        <span className="stats-trophy-label">First message ever</span>
        <span className="stats-trophy-meta">
          {formatShortDate(first.timestamp)} · in {channelNode}
        </span>
        {first.preview && <span className="stats-trophy-preview">
            "{renderCensored(first.preview)}
            {truncated ? "…" : ""}"
          </span>}
      </span>
      <span className="stats-trophy-arrow">
        <ChevronRightIcon />
      </span>
    </button>;
}

function StatCard({
  variant,
  label,
  value,
  suffix,
  sparkline
}: {
  variant: CardVariant;
  label: string;
  value: number;
  suffix?: string;
  sparkline?: number[];
}) {
  return <div className={`stats-tile stats-card stats-card--${variant}`}>
      <div className="stats-card-label">{label}</div>
      <div className="stats-card-value">
        {variant === "chars" ? formatCompact(value) : value.toLocaleString()}
        {suffix ? <span className="stats-card-suffix">{suffix}</span> : null}
      </div>
      {variant === "msg" && sparkline && sparkline.length > 0 && <div className="stats-card-spark" aria-hidden="true">
          {sparkline.map((v, i) => <span key={i} style={{ height: `${Math.max(8, Math.round(v * 100))}%` }} />)}
        </div>}
    </div>;
}

function Section({
  areaClass,
  title,
  subtitle,
  children
}: {
  areaClass: string;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return <section className={`stats-section ${areaClass}`}>
      <div className="stats-section-head">
        <span className="stats-section-title">{title}</span>
        {subtitle ? <span className="stats-section-sub">{subtitle}</span> : null}
      </div>
      {children}
    </section>;
}

function TopConversationsList({
  rows,
  onJump
}: {
  rows: TopConversation[];
  onJump: (id: string) => void;
}) {
  const max = rows[0]?.count ?? 1;
  return <div className="stats-top">
      {rows.map(r => <button key={r.id} type="button" className="stats-top-row" onClick={() => onJump(r.id)} title={r.displayName}>
          {r.avatar ? <img className="stats-top-avatar" src={r.avatar} alt="" /> : <div className="stats-top-avatar" />}
          <div className="stats-top-name">{renderCensored(r.displayName)}</div>
          <div className="stats-top-bar-wrap">
            <div className="stats-top-bar" style={{
          width: `${r.count / max * 100}%`
        }} />
          </div>
          <div className="stats-top-count">{r.count.toLocaleString()}</div>
        </button>)}
    </div>;
}

const TIMELINE_W = 1000;
const TIMELINE_H = 148;
const TIMELINE_PAD = 6;

function DailyTimeline({
  dailyCounts,
  activeDays
}: {
  dailyCounts: Map<string, number>;
  activeDays: number;
}) {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 480px)").matches
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 480px)");
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const {
    barIndex,
    ticks,
    maxCount,
    totalDays,
    points,
    peakBucket
  } = useMemo(() => {
    let minMs = Infinity;
    let maxMs = -Infinity;
    let maxCount = 0;
    for (const [date, v] of dailyCounts) {
      const [y, m, d] = date.split("-").map(Number);
      const ms = Date.UTC(y, m - 1, d);
      if (ms < minMs) minMs = ms;
      if (ms > maxMs) maxMs = ms;
      if (v > maxCount) maxCount = v;
    }
    if (!Number.isFinite(minMs)) {
      return {
        barIndex: new Map<number, { date: string; v: number }>(),
        ticks: [] as { x: number; label: string }[],
        maxCount: 1,
        totalDays: 1,
        points: [[0, TIMELINE_H - TIMELINE_PAD], [TIMELINE_W, TIMELINE_H - TIMELINE_PAD]] as [number, number][],
        peakBucket: 0
      };
    }
    if (maxCount === 0) maxCount = 1;
    const startUTC = minMs;
    const endUTC = maxMs;
    const totalDays = Math.max(1, Math.round((endUTC - startUTC) / 86_400_000) + 1);

    const barIndex = new Map<number, { date: string; v: number }>();
    for (const [date, v] of dailyCounts) {
      const [y, m, d] = date.split("-").map(Number);
      const dayMs = Date.UTC(y, m - 1, d);
      const x = Math.round((dayMs - startUTC) / 86_400_000);
      barIndex.set(x, { date, v });
    }

    const ticks: { x: number; label: string }[] = [];
    const startYear = new Date(startUTC).getUTCFullYear();
    const endYear = new Date(endUTC).getUTCFullYear();
    for (let y = startYear; y <= endYear; y++) {
      const yMs = Date.UTC(y, 0, 1);
      if (yMs < startUTC || yMs > endUTC) {
        if (y === startYear) {
          ticks.push({ x: 0, label: String(startYear) });
        }
        continue;
      }
      const x = (yMs - startUTC) / 86_400_000;
      ticks.push({ x, label: String(y) });
    }
    if (ticks.length === 0) {
      ticks.push({ x: 0, label: String(startYear) });
    }

    if (ticks.length > 1) {
      const MIN_VIEWBOX_GAP = 90;
      const denom = Math.max(1, totalDays - 1);
      const culled: { x: number; label: string }[] = [ticks[0]];
      for (let i = 1; i < ticks.length; i++) {
        const prevPx = (culled[culled.length - 1].x / denom) * TIMELINE_W;
        const curPx = (ticks[i].x / denom) * TIMELINE_W;
        if (curPx - prevPx >= MIN_VIEWBOX_GAP) culled.push(ticks[i]);
      }
      ticks.length = 0;
      ticks.push(...culled);
    }

    const smoothingWindow = isMobile ? 14 : 5;
    const half = Math.floor(smoothingWindow / 2);
    const sourceValueAt = (i: number): number => {
      if (smoothingWindow <= 1) return barIndex.get(i)?.v ?? 0;
      let sum = 0;
      let count = 0;
      for (let j = -half; j <= half; j++) {
        const idx = i + j;
        if (idx >= 0 && idx < totalDays) {
          sum += barIndex.get(idx)?.v ?? 0;
          count++;
        }
      }
      return count > 0 ? sum / count : 0;
    };

    const bucketCount = Math.min(totalDays, isMobile ? 100 : 125);
    const bucketDenom = Math.max(1, bucketCount - 1);
    const bucketValues: number[] = new Array(bucketCount);
    let curveMax = 0;
    for (let b = 0; b < bucketCount; b++) {
      const startDay = Math.floor(b * totalDays / bucketCount);
      const endDay = Math.floor((b + 1) * totalDays / bucketCount);
      const span = Math.max(1, endDay - startDay);
      let sum = 0;
      for (let i = startDay; i < endDay; i++) {
        sum += sourceValueAt(i);
      }
      const v = sum / span;
      bucketValues[b] = v;
      if (v > curveMax) curveMax = v;
    }
    curveMax = Math.max(1, curveMax);

    const points: [number, number][] = [];
    let peakBucket = 0;
    let minY = Infinity;
    for (let b = 0; b < bucketCount; b++) {
      const x = (b / bucketDenom) * TIMELINE_W;
      const y = (1 - bucketValues[b] / curveMax) * (TIMELINE_H - TIMELINE_PAD * 2) + TIMELINE_PAD;
      points.push([x, y]);
      if (y < minY) {
        minY = y;
        peakBucket = b;
      }
    }
    if (points.length === 1) {
      points.push([TIMELINE_W, points[0][1]]);
    }

    return { barIndex, ticks, maxCount, totalDays, points, peakBucket };
  }, [dailyCounts, isMobile]);

  const { areaD, lineD } = useMemo(() => buildSmoothPath(points), [points]);

  const peakX = points[peakBucket]?.[0] ?? 0;
  const peakY = points[peakBucket]?.[1] ?? TIMELINE_PAD;

  const [hover, setHover] = useState<{ date: string; v: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const probeAt = useCallback((clientX: number) => {
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    if (ratio < 0 || ratio > 1) {
      setHover(null);
      return;
    }
    const dayIndex = Math.min(totalDays - 1, Math.max(0, Math.floor(ratio * totalDays)));
    const b = barIndex.get(dayIndex);
    if (!b) {
      setHover(null);
      return;
    }
    setHover({ date: b.date, v: b.v });
  }, [barIndex, totalDays]);

  return <div className="stats-tile stats-timeline">
      <div className="stats-timeline-chart">
        <svg ref={svgRef} className="stats-timeline-svg" viewBox={`0 0 ${TIMELINE_W} ${TIMELINE_H}`} preserveAspectRatio="none" onPointerDown={e => probeAt(e.clientX)} onPointerMove={e => probeAt(e.clientX)} onPointerLeave={() => setHover(null)} onPointerCancel={() => setHover(null)}>
          <g className="stats-timeline-grid">
            {ticks.map((t, i) => i === 0 ? null : <line key={t.label} x1={(t.x / Math.max(1, totalDays - 1)) * TIMELINE_W} x2={(t.x / Math.max(1, totalDays - 1)) * TIMELINE_W} y1={0} y2={TIMELINE_H} />)}
          </g>
          <path d={areaD} fill="var(--accent)" fillOpacity={0.18} />
          <path d={lineD} fill="none" stroke="var(--accent)" strokeWidth={1.75} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {maxCount > 0 && totalDays > 1 && <>
            <div className="stats-timeline-peak-line" style={{
              left: `${(peakX / TIMELINE_W) * 100}%`,
              top: `${(peakY / TIMELINE_H) * 100}%`,
              height: `${(1 - peakY / TIMELINE_H) * 100}%`
            }} />
            <div className="stats-timeline-peak-dot" style={{
              left: `${(peakX / TIMELINE_W) * 100}%`,
              top: `${(peakY / TIMELINE_H) * 100}%`
            }} />
          </>}
      </div>
      <div className="stats-timeline-axis">
        {ticks.map(t => <span key={t.label} style={{
        left: `${t.x / Math.max(1, totalDays - 1) * 100}%`
      }}>
            {t.label}
          </span>)}
      </div>
      <div className="stats-timeline-readout">
        {hover ? `${formatDayKey(hover.date)} · ${hover.v.toLocaleString()} messages` : `${activeDays.toLocaleString()} active days of ${totalDays.toLocaleString()} total`}
      </div>
    </div>;
}

function buildSmoothPath(points: [number, number][]): { areaD: string; lineD: string } {
  if (points.length === 0) return { areaD: "", lineD: "" };
  if (points.length === 1) {
    const [x, y] = points[0];
    const line = `M ${x.toFixed(2)} ${y.toFixed(2)} L ${x.toFixed(2)} ${y.toFixed(2)}`;
    return { lineD: line, areaD: line + ` L ${TIMELINE_W} ${TIMELINE_H} L 0 ${TIMELINE_H} Z` };
  }
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return { lineD: d, areaD: `${d} L ${TIMELINE_W} ${TIMELINE_H} L 0 ${TIMELINE_H} Z` };
}

function Histogram({
  values,
  labels,
  peakIndex: peak
}: {
  values: number[];
  labels: string[];
  peakIndex: number | null;
}) {
  const max = Math.max(1, ...values);
  const [hover, setHover] = useState<number | null>(null);
  return <div className="stats-tile stats-hist">
      <div className="stats-hist-bars">
        {values.map((v, i) => {
        const isPeak = peak !== null && i === peak;
        return <div key={i} className={`stats-hist-bar-wrap${isPeak ? " peak" : ""}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(h => h === i ? null : h)} title={`${labels[i]}: ${v.toLocaleString()}`}>
              <div className="stats-hist-bar" style={{
            height: `${v / max * 100}%`
          }} />
            </div>;
      })}
      </div>
      <div className="stats-hist-axis stats-hist-axis-dense">
        {labels.map((l, i) => <span key={i} className={hover === i ? "active" : undefined}>
            {l}
          </span>)}
      </div>
      <div className="stats-hist-axis stats-hist-axis-sparse" aria-hidden>
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
      </div>
    </div>;
}

function hourLabels(): string[] {
  return Array.from({
    length: 24
  }, (_, h) => {
    if (h === 0) return "12a";
    if (h === 12) return "12p";
    if (h < 12) return `${h}a`;
    return `${h - 12}p`;
  });
}
function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  if (h < 12) return `${h}am`;
  return `${h - 12}pm`;
}
function formatDayKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return formatShortDate(Date.UTC(y, m - 1, d));
}
const compactFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1
});
function formatCompact(n: number): string {
  return compactFormatter.format(n);
}
function peakIndex(values: number[]): number | null {
  let max = -1;
  let idx: number | null = null;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > max) {
      max = values[i];
      idx = i;
    }
  }
  return max > 0 ? idx : null;
}
function peakDayOf(dailyCounts: Map<string, number>): { ms: number; count: number } | null {
  let best: { ms: number; count: number } | null = null;
  for (const [date, v] of dailyCounts) {
    if (!best || v > best.count) {
      const [y, m, d] = date.split("-").map(Number);
      best = { ms: Date.UTC(y, m - 1, d), count: v };
    }
  }
  return best;
}
function buildSparkline(dailyCounts: Map<string, number>, bins: number): number[] {
  if (dailyCounts.size === 0 || bins <= 0) return [];
  let minMs = Infinity;
  let maxMs = -Infinity;
  for (const date of dailyCounts.keys()) {
    const [y, m, d] = date.split("-").map(Number);
    const ms = Date.UTC(y, m - 1, d);
    if (ms < minMs) minMs = ms;
    if (ms > maxMs) maxMs = ms;
  }
  const span = Math.max(1, maxMs - minMs);
  const buckets = new Array<number>(bins).fill(0);
  for (const [date, v] of dailyCounts) {
    const [y, m, d] = date.split("-").map(Number);
    const ms = Date.UTC(y, m - 1, d);
    const ratio = (ms - minMs) / span;
    const idx = Math.min(bins - 1, Math.max(0, Math.floor(ratio * bins)));
    buckets[idx] += v;
  }
  const max = Math.max(1, ...buckets);
  return buckets.map(b => b / max);
}
