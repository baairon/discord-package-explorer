import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { formatRelative, formatShortDate } from "../lib/datetime";
import type { ConversationSummary, Manifest } from "../ingest/types";
import { useSearchResults, type SearchScope } from "../lib/search";
import { SearchHeader } from "./SearchHeader";
import { SearchResultsOverlay } from "./SearchResultsOverlay";
import { BarChartIcon, ChevronDownIcon, LogOutIcon } from "./icons";
import { easePane, overlayVariants, paneSwapVariants } from "../lib/motion";
import { renderCensored } from "../lib/censor";
export type SidebarTab = "servers" | "dms" | "groups";
interface SidebarProps {
  manifest: Manifest;
  data: import("../ingest/types").IngestResult;
  selectedId: string | null;
  search: string;
  statsOpen: boolean;
  tab: SidebarTab;
  onTabChange: (t: SidebarTab) => void;
  onSearch: (s: string) => void;
  onSelect: (id: string) => void;
  onJumpTo: (conversationId: string, messageId: string) => void;
  onCloseSearch: () => void;
  onOpenStats: () => void;
  onLogout: () => void;
}
function tabPlaceholder(tab: SidebarTab): string {
  switch (tab) {
    case "dms":
      return "Search all DMs";
    case "groups":
      return "Search all group chats";
    case "servers":
      return "Search all servers";
  }
}
function tabScope(tab: SidebarTab): SearchScope {
  return tab === "servers" ? "server-all" : "dm-all";
}
function tabOrder(tab: SidebarTab): number {
  return tab === "dms" ? -1 : tab === "groups" ? 0 : 1;
}
interface ServerGroup {
  name: string;
  totalMessages: number;
  channels: ConversationSummary[];
}
export function Sidebar({
  manifest,
  data,
  selectedId,
  search,
  statsOpen,
  tab,
  onTabChange,
  onSearch,
  onSelect,
  onJumpTo,
  onCloseSearch,
  onOpenStats,
  onLogout
}: SidebarProps) {
  const [expandedServers, setExpandedServers] = useState<Set<string>>(() => new Set());
  const activeId = statsOpen ? null : selectedId;
  const trimmedSearch = search.trim();
  const isSearching = trimmedSearch.length >= 2;
  const {
    directs,
    groups
  } = useMemo(() => {
    const directs: ConversationSummary[] = [];
    const groups: ConversationSummary[] = [];
    for (const c of manifest.conversations) {
      if (c.kind === "dm") directs.push(c);else if (c.kind === "group") groups.push(c);
    }
    const byRecency = (a: ConversationSummary, b: ConversationSummary) => (b.lastTs ?? 0) - (a.lastTs ?? 0);
    directs.sort(byRecency);
    groups.sort(byRecency);
    return {
      directs,
      groups
    };
  }, [manifest]);
  const servers = useMemo<ServerGroup[]>(() => {
    const byName = new Map<string, ServerGroup>();
    for (const c of manifest.conversations) {
      if (c.kind !== "server") continue;
      const key = c.serverName ?? `Server ${c.id.slice(-4)}`;
      let g = byName.get(key);
      if (!g) {
        g = {
          name: key,
          totalMessages: 0,
          channels: []
        };
        byName.set(key, g);
      }
      g.totalMessages += c.messageCount;
      g.channels.push(c);
    }
    const out = [...byName.values()];
    out.sort((a, b) => b.totalMessages - a.totalMessages);
    for (const g of out) {
      g.channels.sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, {
        sensitivity: "base"
      }));
    }
    return out;
  }, [manifest]);
  const scope = tabScope(tab);
  const results = useSearchResults(data, isSearching ? search : "", scope, selectedId);
  useEffect(() => {
    if (!selectedId) return;
    const conv = data.manifest.conversations.find(c => c.id === selectedId);
    if (!conv) return;
    const next: SidebarTab = conv.kind === "server" ? "servers" : conv.kind === "group" ? "groups" : "dms";
    onTabChange(next);
  }, [selectedId, data]);
  const toggleServer = (name: string): void => {
    setExpandedServers(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);else next.add(name);
      return next;
    });
  };
  return <div className="sidebar">
      <div className="sidebar-owner" aria-label="Signed in as">
        {manifest.ownerAvatarPath ? <img src={manifest.ownerAvatarPath} alt="" /> : <div className="sidebar-owner-avatar-fallback" />}
        <div className="sidebar-owner-text">
          <div className="sidebar-owner-name">{manifest.ownerDisplayName}</div>
          {manifest.ownerCreatedAt && <div className="sidebar-owner-meta">
              Joined {formatShortDate(manifest.ownerCreatedAt)}
            </div>}
        </div>
        <button type="button" className="logout-btn" onClick={onLogout} aria-label="Sign out" title="Sign out">
          <LogOutIcon />
        </button>
      </div>
      <SearchHeader search={search} placeholder={tabPlaceholder(tab)} onSearch={onSearch} />

      <button type="button" className={`stats-link${statsOpen ? " active" : ""}`} onClick={onOpenStats} aria-pressed={statsOpen}>
        <BarChartIcon />
        <span>Stats</span>
      </button>

      <div className="sidebar-tabs" role="tablist" aria-label="Conversation kind">
        <TabButton label="DMs" count={directs.length} active={tab === "dms"} onClick={() => onTabChange("dms")} />
        <TabButton label="Groups" count={groups.length} active={tab === "groups"} onClick={() => onTabChange("groups")} />
        <TabButton label="Servers" count={servers.length} active={tab === "servers"} onClick={() => onTabChange("servers")} />
      </div>

      <div className="sidebar-body">
        <AnimatePresence mode="wait" custom={tabOrder(tab)} initial={false}>
          <m.div key={tab} className="sidebar-scroll" custom={tabOrder(tab)} variants={paneSwapVariants} initial="enter" animate="center" exit="exit">
            {tab === "servers" && (servers.length === 0 ? <div className="sidebar-empty">No servers.</div> : servers.map(g => {
            const expanded = expandedServers.has(g.name);
            const childActive = !!activeId && g.channels.some(c => c.id === activeId);
            return <div key={g.name}>
                      <button type="button" className={`row server-row${childActive ? " active" : ""}`} onClick={() => toggleServer(g.name)} title={g.name}>
                        <span className={`server-chevron${expanded ? "" : " collapsed"}`}>
                          <Chevron collapsed={!expanded} small />
                        </span>
                        <div className="row-text">
                          <div className="row-name">{renderCensored(g.name)}</div>
                          <div className="row-sub">
                            {plural(g.channels.length, "channel")} · {plural(g.totalMessages, "message")}
                          </div>
                        </div>
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded && <m.div key="channels" initial={{
                  height: 0,
                  opacity: 0
                }} animate={{
                  height: "auto",
                  opacity: 1
                }} exit={{
                  height: 0,
                  opacity: 0
                }} transition={easePane} style={{
                  overflow: "hidden"
                }}>
                            {g.channels.map(c => {
                    const active = c.id === activeId;
                    return <button key={c.id} type="button" className={`row indent${active ? " active" : ""}`} onClick={() => onSelect(c.id)} title={c.displayName}>
                                  <span className="row-hash">#</span>
                                  <div className="row-text">
                                    <div className="row-name">{renderCensored(c.displayName)}</div>
                                    <div className="row-sub">
                                      {plural(c.messageCount, "message")}
                                    </div>
                                  </div>
                                </button>;
                  })}
                          </m.div>}
                      </AnimatePresence>
                    </div>;
          }))}

            {tab === "dms" && (directs.length === 0 ? <div className="sidebar-empty">No direct messages.</div> : directs.map(c => <DmRow key={c.id} conv={c} active={c.id === activeId} onClick={() => onSelect(c.id)} />))}

            {tab === "groups" && (groups.length === 0 ? <div className="sidebar-empty">No group chats.</div> : groups.map(c => <DmRow key={c.id} conv={c} active={c.id === activeId} onClick={() => onSelect(c.id)} />))}
          </m.div>
        </AnimatePresence>

        <AnimatePresence>
          {isSearching && <m.div key="sidebar-search-results" className="search-overlay-wrap" variants={overlayVariants} initial="enter" animate="center" exit="exit">
              <SearchResultsOverlay results={results} query={trimmedSearch} onJumpTo={(cid, mid) => {
            onJumpTo(cid, mid);
            onCloseSearch();
          }} onClose={onCloseSearch} />
            </m.div>}
        </AnimatePresence>
      </div>

      <div className="sidebar-footer">
        {manifest.ownerAvatarPath ? <img src={manifest.ownerAvatarPath} alt="" /> : <div className="row-avatar" />}
        <div className="sidebar-footer-text">
          <div className="name">{manifest.ownerDisplayName}</div>
          {manifest.ownerCreatedAt && <div className="sidebar-footer-meta">
              Joined {formatShortDate(manifest.ownerCreatedAt)}
            </div>}
        </div>
        <button type="button" className="logout-btn" onClick={onLogout} aria-label="Sign out" title="Sign out">
          <LogOutIcon />
        </button>
      </div>
    </div>;
}
function TabButton({
  label,
  count,
  active,
  onClick
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return <button type="button" role="tab" aria-selected={active} className={`sidebar-tab${active ? " active" : ""}`} onClick={onClick}>
      <span>{label}</span>
      <span className="sidebar-tab-count">{count.toLocaleString()}</span>
    </button>;
}
function formatLastTs(ts: number | null): string | null {
  if (!ts) return null;
  return formatRelative(ts);
}
function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n.toLocaleString()} ${n === 1 ? singular : pluralForm}`;
}
function DmRow({
  conv,
  active,
  onClick
}: {
  conv: ConversationSummary;
  active: boolean;
  onClick: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const avatar = conv.participants.find(p => !p.isOwner)?.avatarUrl ?? conv.participants[0]?.avatarUrl ?? null;
  const lastSeen = formatLastTs(conv.lastTs);
  const msgs = plural(conv.messageCount, "message");
  const subtitle = conv.kind === "group" ? [plural(conv.participants.length, "member"), msgs, lastSeen].filter(Boolean).join(" · ") : [msgs, lastSeen].filter(Boolean).join(" · ");
  return <button type="button" className={`row${active ? " active" : ""}`} onClick={onClick} title={conv.displayName}>
      {avatar && !failed ? <img className="row-avatar" src={avatar} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : <div className="row-avatar" />}
      <div className="row-text">
        <div className="row-name">{renderCensored(conv.displayName)}</div>
        {subtitle && <div className="row-sub">{subtitle}</div>}
      </div>
    </button>;
}
function Chevron({
  collapsed,
  small
}: {
  collapsed: boolean;
  small?: boolean;
}) {
  return <span style={{
    transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
    transition: "transform 180ms var(--ease-standard)",
    display: "inline-flex"
  }} aria-hidden>
      <ChevronDownIcon size={small ? 12 : 14} />
    </span>;
}
