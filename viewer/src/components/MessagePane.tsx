import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { formatShortDate, formatShortDateTime } from "../lib/datetime";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import type { ConversationKind, ConversationSummary, IngestResult, Manifest, Message, Participant } from "../ingest/types";
import { getAttachments } from "../lib/attachments";
import { useSearchResults, type SearchScope } from "../lib/search";
import { MessageRow } from "./MessageRow";
import { SearchHeader } from "./SearchHeader";
import { SearchResultsOverlay } from "./SearchResultsOverlay";
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, InboxIcon, PlayIcon, XIcon } from "./icons";
import { conversationFadeVariants, modalVariants, overlayVariants } from "../lib/motion";
import { renderCensored } from "../lib/censor";
interface MessagePaneProps {
  summary: ConversationSummary | null;
  messages: Message[];
  manifest: Manifest;
  data: IngestResult;
  selectedId: string | null;
  onSearchJumpTo: (conversationId: string, messageId: string) => void;
  galleryOpen: boolean;
  onToggleGallery: () => void;
  pendingScrollId: string | null;
  onJumpTo: (messageId: string) => void;
  onPendingConsumed: () => void;
  onBack: () => void;
  highlightQuery?: string;
  isMobileOpen: boolean;
}
type MediaMode = "all" | "images" | "videos";
interface GalleryItem {
  messageId: string;
  url: string;
  filename: string;
  kind: "image" | "video";
  timestamp: number;
  authorId?: string;
}
const EMPTY_GALLERY: GalleryItem[] = [];
function buildGalleryItems(messages: Message[]): GalleryItem[] {
  const out: GalleryItem[] = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    for (const a of getAttachments(m)) {
      if (a.kind === "image" || a.kind === "video") {
        out.push({
          messageId: m.id,
          url: a.url,
          filename: a.filename,
          kind: a.kind,
          timestamp: m.timestamp,
          authorId: m.authorId
        });
      }
    }
  }
  return out;
}
function TimelineEndFooter({ lastTimestamp }: { lastTimestamp?: number }) {
  return (
    <div className="timeline-end" role="status" aria-label="End of conversation">
      <span className="timeline-end-rule" aria-hidden />
      <span className="timeline-end-label">
        End of conversation
        {lastTimestamp ? <span className="timeline-end-date">{formatShortDate(lastTimestamp)}</span> : null}
      </span>
      <span className="timeline-end-rule" aria-hidden />
    </div>
  );
}
export function MessagePane({
  summary,
  messages,
  manifest,
  data,
  selectedId,
  onSearchJumpTo,
  galleryOpen,
  onToggleGallery,
  pendingScrollId,
  onJumpTo,
  onPendingConsumed,
  onBack,
  highlightQuery,
  isMobileOpen
}: MessagePaneProps) {
  const [convSearch, setConvSearch] = useState("");
  const trimmedSearch = convSearch.trim();
  const isSearching = trimmedSearch.length >= 2;
  useEffect(() => {
    setConvSearch("");
  }, [selectedId]);
  const convScope: SearchScope = summary?.kind === "server" ? "server-channel" : "dm-one";
  const convPlaceholder = summary?.kind === "server" ? "Search this channel" : summary?.kind === "group" ? "Search this group chat" : "Search this DM";
  const searchResults = useSearchResults(data, isSearching ? convSearch : "", convScope, selectedId);
  const closeConvSearch = () => setConvSearch("");
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const [mediaMode, setMediaMode] = useState<MediaMode>("all");
  const [lightboxState, setLightboxState] = useState<{
    items: GalleryItem[];
    index: number;
    showJumpTo: boolean;
  } | null>(null);
  useEffect(() => {
    setLightboxState(null);
  }, [summary?.id]);
  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    messages.forEach((msg, i) => m.set(msg.id, i));
    return m;
  }, [messages]);
  useEffect(() => {
    if (galleryOpen) return;
    if (!pendingScrollId) return;
    const idx = indexById.get(pendingScrollId);
    if (idx == null) {
      onPendingConsumed();
      return;
    }
    const raf = requestAnimationFrame(() => {
      virtuosoRef.current?.scrollToIndex({
        index: idx,
        align: "center"
      });
    });
    const timer = window.setTimeout(onPendingConsumed, 2500);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [galleryOpen, pendingScrollId, indexById, onPendingConsumed]);
  const hasMedia = useMemo(() => {
    for (const m of messages) {
      if (m.attachmentsRaw) return true;
    }
    return false;
  }, [messages]);
  const allGalleryItems = useMemo<GalleryItem[]>(() => galleryOpen ? buildGalleryItems(messages) : EMPTY_GALLERY, [galleryOpen, messages]);
  const openLightboxFromInline = useCallback((url: string) => {
    const items = allGalleryItems !== EMPTY_GALLERY ? allGalleryItems : buildGalleryItems(messages);
    const idx = items.findIndex(g => g.url === url);
    if (idx < 0) return;
    setLightboxState({
      items,
      index: idx,
      showJumpTo: false
    });
  }, [allGalleryItems, messages]);
  const {
    imageCount,
    videoCount
  } = useMemo(() => {
    let imageCount = 0;
    let videoCount = 0;
    for (const g of allGalleryItems) {
      if (g.kind === "image") imageCount++;else videoCount++;
    }
    return {
      imageCount,
      videoCount
    };
  }, [allGalleryItems]);
  const visibleGalleryItems = useMemo(() => {
    if (mediaMode === "all") return allGalleryItems;
    if (mediaMode === "images") return allGalleryItems.filter(g => g.kind === "image");
    return allGalleryItems.filter(g => g.kind === "video");
  }, [allGalleryItems, mediaMode]);
  const participantsById = useMemo(() => {
    const m = new Map<string, Participant>();
    if (summary) for (const p of summary.participants) m.set(p.id, p);
    return m;
  }, [summary]);
  const paneClass = `pane${isMobileOpen ? " open" : ""}`;
  const itemContent = useCallback((_: number, m: Message) => <MessageRow message={m} participants={summary?.participants ?? []} manifest={manifest} highlight={pendingScrollId === m.id} highlightQuery={highlightQuery} onOpenAttachment={openLightboxFromInline} />, [summary, manifest, pendingScrollId, highlightQuery, openLightboxFromInline]);
  if (!summary) {
    return <div className={`${paneClass} pane-empty`}>Pick a conversation.</div>;
  }
  const range = summary.firstTs && summary.lastTs ? `${formatShortDate(summary.firstTs)} – ${formatShortDate(summary.lastTs)}` : "no messages";
  return <div className={paneClass}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div key={summary.id} className="pane-fader" variants={conversationFadeVariants} initial="enter" animate="center" exit="exit">
      <div className="pane-header">
        <div className="pane-header-left">
          <button className="mobile-back" onClick={onBack} aria-label="Back to conversations">
            <ArrowLeftIcon />
          </button>
          <div>
            <div className="pane-title">
              {summary.kind === "server" ? <>#{renderCensored(summary.displayName)}</> : renderCensored(summary.displayName)}
            </div>
            <div className="pane-meta">
              {kindLabel(summary.kind)} · {summary.messageCount === 1 ? "1 message" : `${summary.messageCount.toLocaleString()} messages`} · {range}
            </div>
          </div>
        </div>
        {}
        <SearchHeader className="pane-search-inline" search={convSearch} placeholder={convPlaceholder} onSearch={setConvSearch} />
        {hasMedia && <button className="pane-gallery-toggle" onClick={onToggleGallery}>
            {galleryOpen ? "Messages" : "Media"}
          </button>}
      </div>
      <div className={galleryOpen ? "pane-body gallery-open" : "pane-body"}>
        <SearchHeader className="pane-search" search={convSearch} placeholder={convPlaceholder} onSearch={setConvSearch} />
        {messages.length === 0 && !hasMedia && <div className="pane-empty pane-empty-conv">
            <div className="pane-empty-icon-wrap" aria-hidden>
              <InboxIcon />
            </div>
            <div className="pane-empty-title">No messages here</div>
          </div>}
        <div className="pane-views">
          {messages.length > 0 && <div className="message-list" data-active={!galleryOpen}>
            <Virtuoso ref={virtuosoRef} data={messages} followOutput="auto" initialTopMostItemIndex={messages.length - 1} increaseViewportBy={400} itemContent={itemContent} components={{
        Footer: () => <TimelineEndFooter lastTimestamp={messages[messages.length - 1]?.timestamp} />
      }} />
          </div>}
          {hasMedia && <div className="gallery" data-active={galleryOpen}>
            <div className="media-toggle">
              <button type="button" className={`chip${mediaMode === "all" ? " active" : ""}`} onClick={() => setMediaMode("all")}>
                All ({allGalleryItems.length})
              </button>
              <button type="button" className={`chip${mediaMode === "images" ? " active" : ""}`} onClick={() => setMediaMode("images")} disabled={imageCount === 0}>
                Images ({imageCount})
              </button>
              <button type="button" className={`chip${mediaMode === "videos" ? " active" : ""}`} onClick={() => setMediaMode("videos")} disabled={videoCount === 0}>
                Videos ({videoCount})
              </button>
            </div>
            {visibleGalleryItems.length === 0 ? <div className="pane-empty">No {mediaMode}.</div> : <div className="mosaic">
                {visibleGalleryItems.map((g, i) => <MediaTile key={`${g.messageId}-${g.url}`} item={g} onClick={() => setLightboxState({
            items: visibleGalleryItems,
            index: i,
            showJumpTo: true
          })} />)}
              </div>}
          </div>}
        </div>
        <AnimatePresence>
          {lightboxState && lightboxState.items[lightboxState.index] && <MediaLightbox key="lightbox" items={lightboxState.items} index={lightboxState.index} participantsById={participantsById} manifest={manifest} showJumpTo={lightboxState.showJumpTo} onClose={() => setLightboxState(null)} onIndex={next => setLightboxState(prev => prev ? {
          ...prev,
          index: next
        } : prev)} onJumpTo={mid => {
          setLightboxState(null);
          onJumpTo(mid);
        }} />}
        </AnimatePresence>
        <AnimatePresence>
          {isSearching && <m.div key="pane-search-results" className="search-overlay-wrap pane-search-overlay-wrap" variants={overlayVariants} initial="enter" animate="center" exit="exit">
              <SearchResultsOverlay className="pane-search-overlay" results={searchResults} query={trimmedSearch} onJumpTo={(cid, mid) => {
            closeConvSearch();
            onSearchJumpTo(cid, mid);
          }} onClose={closeConvSearch} />
            </m.div>}
        </AnimatePresence>
      </div>
        </m.div>
      </AnimatePresence>
    </div>;
}
function kindLabel(k: ConversationKind): string {
  return k === "dm" ? "DM" : k === "group" ? "Group chat" : "Server channel";
}
function MediaLightbox({
  items,
  index,
  participantsById,
  manifest,
  showJumpTo = true,
  onClose,
  onIndex,
  onJumpTo
}: {
  items: GalleryItem[];
  index: number;
  participantsById: Map<string, Participant>;
  manifest: Manifest;
  showJumpTo?: boolean;
  onClose: () => void;
  onIndex: (next: number) => void;
  onJumpTo: (messageId: string) => void;
}) {
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;
  const sender = useMemo(() => {
    if (!item) return null;
    const author = item.authorId ? participantsById.get(item.authorId) : undefined;
    const isOwner = !item.authorId || author?.isOwner;
    if (isOwner) {
      return {
        name: manifest.ownerDisplayName,
        avatar: manifest.ownerAvatarPath ?? author?.avatarUrl
      };
    }
    return {
      name: author?.username ?? "Unknown",
      avatar: author?.avatarUrl ?? manifest.ownerAvatarPath
    };
  }, [item, participantsById, manifest]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        onIndex(index - 1);
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        onIndex(index + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, hasPrev, hasNext, onClose, onIndex]);
  if (!item) return null;
  return createPortal(<m.div className="lightbox" role="dialog" aria-modal="true" aria-label={item.filename} onClick={onClose} variants={modalVariants} initial="enter" animate="center" exit="exit">
      <div className="lightbox-actions">
        {showJumpTo && <button type="button" className="lightbox-action" onClick={e => {
        e.stopPropagation();
        onJumpTo(item.messageId);
      }}>
            Jump to message
          </button>}
        <button type="button" className="lightbox-action lightbox-close" onClick={e => {
        e.stopPropagation();
        onClose();
      }} aria-label="Close (Esc)" title="Close (Esc)">
          <XIcon />
        </button>
      </div>

      {hasPrev && <button type="button" className="lightbox-nav lightbox-nav-prev" onClick={e => {
      e.stopPropagation();
      onIndex(index - 1);
    }} aria-label="Previous" title="Previous (←)">
          <ChevronLeftIcon />
        </button>}
      {hasNext && <button type="button" className="lightbox-nav lightbox-nav-next" onClick={e => {
      e.stopPropagation();
      onIndex(index + 1);
    }} aria-label="Next" title="Next (→)">
          <ChevronRightIcon />
        </button>}

      <div className="lightbox-frame">
        {item.kind === "image" ? <img src={item.url} alt={item.filename} referrerPolicy="no-referrer" onClick={e => e.stopPropagation()} /> : <video src={item.url} controls autoPlay playsInline crossOrigin="anonymous" onClick={e => e.stopPropagation()} />}
      </div>

      <div className="lightbox-caption" onClick={e => e.stopPropagation()}>
        {sender?.avatar ? <img className="lightbox-caption-avatar" src={sender.avatar} alt="" referrerPolicy="no-referrer" /> : <div className="lightbox-caption-avatar" />}
        <div className="lightbox-caption-meta">
          <span className="lightbox-caption-author">{sender?.name ?? manifest.ownerDisplayName}</span>
          <span className="lightbox-caption-date">{formatShortDateTime(item.timestamp)}</span>
        </div>
        <span className="lightbox-caption-name">{item.filename}</span>
        <span className="lightbox-caption-pos">
          {index + 1} of {items.length}
        </span>
      </div>
    </m.div>, document.body);
}
function MediaTile({
  item,
  onClick
}: {
  item: GalleryItem;
  onClick: () => void;
}) {
  const [dims, setDims] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  let colSpan = 1;
  let rowSpan = 1;
  if (dims && dims.w > 0 && dims.h > 0) {
    const ratio = dims.w / dims.h;
    if (ratio >= 2.2) colSpan = 3;else if (ratio >= 1.4) colSpan = 2;else if (ratio <= 0.45) rowSpan = 3;else if (ratio <= 0.71) rowSpan = 2;
  }
  const onVideoEnter = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  };
  const onVideoLeave = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    try {
      v.currentTime = 0.1;
    } catch {}
  };
  return <button className={item.kind === "video" ? "tile video-tile" : "tile"} onClick={onClick} onMouseEnter={item.kind === "video" ? onVideoEnter : undefined} onMouseLeave={item.kind === "video" ? onVideoLeave : undefined} title={item.filename} aria-label={`Jump to ${item.filename}`} style={{
    gridColumn: `span ${colSpan}`,
    gridRow: `span ${rowSpan}`
  }}>
      {item.kind === "image" ? <img src={item.url} alt={item.filename} loading="lazy" decoding="async" referrerPolicy="no-referrer" onLoad={e => {
      const el = e.currentTarget;
      if (el.naturalWidth && el.naturalHeight) setDims({
        w: el.naturalWidth,
        h: el.naturalHeight
      });
    }} /> : <>
          <video ref={videoRef} src={item.url} preload="metadata" muted playsInline loop crossOrigin="anonymous" onLoadedMetadata={e => {
        const el = e.currentTarget;
        if (el.videoWidth && el.videoHeight) setDims({
          w: el.videoWidth,
          h: el.videoHeight
        });
        try {
          el.currentTime = 0.1;
        } catch {}
      }} />
          <span className="play-overlay" aria-hidden>
            <PlayIcon />
          </span>
        </>}
    </button>;
}
