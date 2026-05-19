import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IngestResult } from "../ingest/types";
import { type FirstMessage, type TopConversation } from "../lib/stats";
import { useStatsWorker } from "../lib/useStatsWorker";
import { formatShortDate } from "../lib/datetime";
import { ArrowLeftIcon, ChevronRightIcon, TrophyIcon } from "./icons";
import { renderCensored } from "../lib/censor";
interface StatsPageProps {
  data: IngestResult;
  onBack: () => void;
  onJumpToConversation: (id: string) => void;
  onJumpToMessage: (channelId: string, messageId: string) => void;
}
export function StatsPage({
  data,
  onBack,
  onJumpToConversation,
  onJumpToMessage
}: StatsPageProps) {
  const { stats } = useStatsWorker(data);
  const [open, setOpen] = useState(false);
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
      </div>
      <div className="pane-body stats-body">
        <Hero name={data.manifest.ownerDisplayName} avatar={data.manifest.ownerAvatarPath} createdAt={data.manifest.ownerCreatedAt} />

        {stats.firstMessage && <Trophy first={stats.firstMessage} onJump={onJumpToMessage} />}

        <div className="stats-grid">
          <StatCard label="Messages sent" value={stats.totalMessages} />
          <StatCard label="Characters typed" value={stats.totalCharacters} />
          <StatCard label="People you talked to" value={stats.peopleTalkedTo} />
          <StatCard label="Best message streak" value={stats.longestStreak} suffix="days" />
        </div>

        {stats.dailyCounts.size > 0 && <Section title="Activity over time">
            <DailyTimeline dailyCounts={stats.dailyCounts} />
          </Section>}

        <Section title="Top conversations">
          {stats.topConversations.length === 0 ? <div className="stats-empty">No DM or group activity in this export.</div> : <TopConversationsList rows={stats.topConversations} onJump={onJumpToConversation} />}
        </Section>

        <Section title="Hour of day" subtitle={peakHour !== null ? `Peak at ${formatHour(peakHour)}` : undefined}>
          <Histogram values={stats.hourHistogram} labels={hourLabels()} />
        </Section>
      </div>
    </div>;
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
            “{renderCensored(first.preview)}
            {truncated ? "…" : ""}”
          </span>}
      </span>
      <span className="stats-trophy-arrow">
        <ChevronRightIcon />
      </span>
    </button>;
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
  return <div className="stats-hero">
      {avatar ? <img className="stats-hero-avatar" src={avatar} alt="" /> : <div className="stats-hero-avatar" />}
      <div className="stats-hero-text">
        <div className="stats-hero-name">{name}</div>
        {createdAt && <div className="stats-hero-meta">Joined {formatShortDate(createdAt)}</div>}
      </div>
    </div>;
}
function StatCard({
  label,
  value,
  suffix
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return <div className="stats-card">
      <div className="stats-card-label">{label}</div>
      <div className="stats-card-value">
        {value.toLocaleString()}
        {suffix ? <span className="stats-card-suffix"> {suffix}</span> : null}
      </div>
    </div>;
}
function Section({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return <div className="stats-section">
      <div className="stats-section-head">
        <span className="stats-section-title">{title}</span>
        {subtitle && <span className="stats-section-sub">{subtitle}</span>}
      </div>
      {children}
    </div>;
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
          <div className="stats-top-name-col">
            <div className="stats-top-name">{renderCensored(r.displayName)}</div>
          </div>
          <div className="stats-top-bar-wrap">
            <div className="stats-top-bar" style={{
          width: `${r.count / max * 100}%`
        }} />
          </div>
          <div className="stats-top-count">{r.count.toLocaleString()}</div>
        </button>)}
    </div>;
}
const TIMELINE_HEIGHT = 90;
const TIMELINE_TICK_HEIGHT = 18;
function DailyTimeline({
  dailyCounts
}: {
  dailyCounts: Map<string, number>;
}) {
  const {
    bars,
    ticks,
    maxCount,
    totalDays
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
        bars: [],
        ticks: [],
        maxCount: 1,
        totalDays: 1
      };
    }
    if (maxCount === 0) maxCount = 1;
    const startUTC = minMs;
    const endUTC = maxMs;
    const totalDays = Math.max(1, Math.round((endUTC - startUTC) / 86_400_000) + 1);
    const bars: {
      x: number;
      v: number;
      date: string;
    }[] = [];
    for (const [date, v] of dailyCounts) {
      const [y, m, d] = date.split("-").map(Number);
      const dayMs = Date.UTC(y, m - 1, d);
      const x = (dayMs - startUTC) / 86_400_000;
      bars.push({
        x,
        v,
        date
      });
    }
    const ticks: {
      x: number;
      label: string;
    }[] = [];
    const startYear = new Date(startUTC).getUTCFullYear();
    const endYear = new Date(endUTC).getUTCFullYear();
    for (let y = startYear; y <= endYear; y++) {
      const yMs = Date.UTC(y, 0, 1);
      if (yMs < startUTC || yMs > endUTC) {
        if (y === startYear) {
          ticks.push({
            x: 0,
            label: String(startYear)
          });
        }
        continue;
      }
      const x = (yMs - startUTC) / 86_400_000;
      ticks.push({
        x,
        label: String(y)
      });
    }
    if (ticks.length === 0) {
      ticks.push({
        x: 0,
        label: String(startYear)
      });
    }
    return {
      bars,
      ticks,
      maxCount,
      totalDays
    };
  }, [dailyCounts]);
  const [hover, setHover] = useState<{
    x: number;
    date: string;
    v: number;
  } | null>(null);
  const W = 1000;
  const colW = W / totalDays;
  const barIndex = useMemo(() => {
    const m = new Map<number, {
      date: string;
      v: number;
    }>();
    for (const b of bars) m.set(b.x, {
      date: b.date,
      v: b.v
    });
    return m;
  }, [bars]);
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
    setHover({
      x: dayIndex * colW,
      date: b.date,
      v: b.v
    });
  }, [barIndex, totalDays, colW]);
  return <div className="stats-timeline">
      <svg ref={svgRef} className="stats-timeline-svg" viewBox={`0 0 ${W} ${TIMELINE_HEIGHT + TIMELINE_TICK_HEIGHT}`} preserveAspectRatio="none" onPointerDown={e => probeAt(e.clientX)} onPointerMove={e => probeAt(e.clientX)} onPointerLeave={() => setHover(null)} onPointerCancel={() => setHover(null)}>
        {}
        {ticks.map((t, i) => i === 0 ? null : <line key={t.label} x1={t.x * colW} x2={t.x * colW} y1={0} y2={TIMELINE_HEIGHT} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />)}
        {}
        {bars.map(b => {
        if (b.v === 0) return null;
        const h = Math.max(2, b.v / maxCount * TIMELINE_HEIGHT);
        const x = b.x * colW;
        const barW = Math.max(1, colW * 0.95);
        return <rect key={b.date} x={x} y={TIMELINE_HEIGHT - h} width={barW} height={h} fill="var(--accent)" opacity={0.85}>
              <title>{`${formatDayKey(b.date)} — ${b.v.toLocaleString()} messages`}</title>
            </rect>;
      })}
      </svg>
      <div className="stats-timeline-axis">
        {ticks.map(t => <span key={t.label} style={{
        left: `${t.x / totalDays * 100}%`
      }}>
            {t.label}
          </span>)}
      </div>
      <div className="stats-timeline-readout">
        {hover ? `${formatDayKey(hover.date)} — ${hover.v.toLocaleString()} messages` : `Peak ${maxCount.toLocaleString()} in one day · ${totalDays.toLocaleString()} days total`}
      </div>
    </div>;
}
function Histogram({
  values,
  labels
}: {
  values: number[];
  labels: string[];
}) {
  const max = Math.max(1, ...values);
  const [hover, setHover] = useState<number | null>(null);
  return <div className="stats-hist">
      <div className="stats-hist-bars">
        {values.map((v, i) => <div key={i} className="stats-hist-bar-wrap" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(h => h === i ? null : h)} title={`${labels[i]}: ${v.toLocaleString()}`}>
            <div className="stats-hist-bar" style={{
          height: `${v / max * 100}%`
        }} />
          </div>)}
      </div>
      {}
      <div className="stats-hist-axis stats-hist-axis-dense">
        {labels.map((l, i) => <span key={i} className={hover === i ? "active" : undefined}>
            {l}
          </span>)}
      </div>
      {}
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
