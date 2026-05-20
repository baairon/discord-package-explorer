import { useCallback, useEffect, useMemo, useState } from "react";
import { LazyMotion, domAnimation, AnimatePresence, m } from "framer-motion";
import { DropZone } from "./components/DropZone";
import { Sidebar, type SidebarTab } from "./components/Sidebar";
import { MessagePane } from "./components/MessagePane";
import { StatsPage } from "./components/StatsPage";
import { MobileNav, type MobileNavTab } from "./components/MobileNav";
import { GitHubIcon } from "./components/icons";
import { CSS } from "./styles";
import { paneSwapVariants } from "./lib/motion";
import type { IngestResult } from "./ingest/types";
export default function App() {
  const [data, setData] = useState<IngestResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("dms");
  const onIngested = useCallback((result: IngestResult) => {
    setData(prev => {
      if (prev?.ownerAvatarBlobUrl) URL.revokeObjectURL(prev.ownerAvatarBlobUrl);
      return result;
    });
    setSelectedId(null);
    setSearch("");
    setGalleryOpen(false);
    setPendingScrollId(null);
    setMobileOpen(false);
    setStatsOpen(false);
    setSidebarTab("dms");
  }, []);
  useEffect(() => {
    setGalleryOpen(false);
  }, [selectedId]);
  useEffect(() => {
    if (!data) return;
    if (selectedId) return;
    const mostRecent = (kind: "dm" | "group") => data.manifest.conversations.filter(c => c.kind === kind).sort((a, b) => (b.lastTs ?? 0) - (a.lastTs ?? 0))[0];
    const fallback = mostRecent("dm") ?? mostRecent("group");
    if (fallback) setSelectedId(fallback.id);
  }, [data, selectedId]);
  const summary = useMemo(() => data?.manifest.conversations.find(c => c.id === selectedId) ?? null, [data, selectedId]);
  const highlightQuery = useMemo(() => {
    const trimmed = search.trim();
    return trimmed.length >= 2 ? trimmed : undefined;
  }, [search]);
  const messages = useMemo(() => selectedId ? data?.messagesByChannel.get(selectedId) ?? [] : [], [data, selectedId]);
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setPendingScrollId(null);
    setMobileOpen(true);
    setStatsOpen(false);
  }, []);
  const handleJumpTo = useCallback((conversationId: string, messageId: string) => {
    setSelectedId(conversationId);
    setPendingScrollId(messageId);
    setMobileOpen(true);
    setStatsOpen(false);
  }, []);
  const handleCloseSearch = useCallback(() => setSearch(""), []);
  const handleOpenStats = useCallback(() => {
    setStatsOpen(true);
    setMobileOpen(true);
  }, []);
  const handleCloseStats = useCallback(() => {
    setStatsOpen(false);
    setMobileOpen(false);
  }, []);
  const handleLogout = useCallback(() => {
    setData(prev => {
      if (prev?.ownerAvatarBlobUrl) URL.revokeObjectURL(prev.ownerAvatarBlobUrl);
      return null;
    });
    setSelectedId(null);
    setSearch("");
    setGalleryOpen(false);
    setPendingScrollId(null);
    setMobileOpen(false);
    setStatsOpen(false);
    setSidebarTab("dms");
  }, []);
  const handleMobileNav = useCallback((tab: MobileNavTab) => {
    if (tab === "stats") {
      setStatsOpen(true);
      setMobileOpen(true);
      return;
    }
    setSidebarTab(tab);
    setStatsOpen(false);
    setMobileOpen(false);
  }, []);
  const mobileNavActive: MobileNavTab = statsOpen ? "stats" : sidebarTab;
  const dir = statsOpen ? -1 : 1;
  return <LazyMotion features={domAnimation} strict>
      <style>{CSS}</style>
      {data ? <div className="root">
          <Sidebar manifest={data.manifest} data={data} selectedId={selectedId} search={search} statsOpen={statsOpen} tab={sidebarTab} onTabChange={setSidebarTab} onSearch={setSearch} onSelect={handleSelect} onJumpTo={handleJumpTo} onCloseSearch={handleCloseSearch} onOpenStats={handleOpenStats} onLogout={handleLogout} />
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {statsOpen ? <m.div key="stats" custom={dir} variants={paneSwapVariants} initial="enter" animate="center" exit="exit" className="pane-swap">
                <StatsPage data={data} onBack={handleCloseStats} onJumpToConversation={id => handleSelect(id)} onJumpToMessage={(cid, mid) => handleJumpTo(cid, mid)} />
              </m.div> : <m.div key="messages" custom={dir} variants={paneSwapVariants} initial="enter" animate="center" exit="exit" className="pane-swap">
                <MessagePane summary={summary} messages={messages} manifest={data.manifest} data={data} selectedId={selectedId} onSearchJumpTo={handleJumpTo} galleryOpen={galleryOpen} onToggleGallery={() => setGalleryOpen(g => !g)} pendingScrollId={pendingScrollId} onJumpTo={id => {
            setGalleryOpen(false);
            setPendingScrollId(id);
          }} onPendingConsumed={() => setPendingScrollId(null)} onBack={() => setMobileOpen(false)} highlightQuery={highlightQuery} isMobileOpen={mobileOpen} />
              </m.div>}
          </AnimatePresence>
          <MobileNav active={mobileNavActive} onSelect={handleMobileNav} />
        </div> : <>
          <DropZone onIngested={onIngested} />
          <div className="corner-links">
            <a className="corner-link" href="https://github.com/baairon/discord-package-explorer" target="_blank" rel="noreferrer" aria-label="GitHub repository" title="GitHub repository">
              <GitHubIcon />
            </a>
          </div>
        </>}
    </LazyMotion>;
}
