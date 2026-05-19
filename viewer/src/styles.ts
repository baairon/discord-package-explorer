export const CSS = String.raw`
@font-face {
  font-family: "gg sans";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("assets/fonts/gg-sans-regular.ttf") format("truetype"),
       local("gg sans"), local("ggsans"), local("gg sans Normal");
}
@font-face {
  font-family: "gg sans";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url("assets/fonts/gg-sans-regular.ttf") format("truetype"),
       local("gg sans Medium"), local("ggsans-Medium");
}
@font-face {
  font-family: "gg sans";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("assets/fonts/gg-sans-bold.ttf") format("truetype"),
       local("gg sans Semibold"), local("ggsans-Semibold");
}
@font-face {
  font-family: "gg sans";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url("assets/fonts/gg-sans-bold.ttf") format("truetype"),
       local("gg sans Bold"), local("ggsans-Bold");
}

:root {
  
  --surface-0: #0a0a0a;
  --surface-1: #070709;
  --surface-2: #17171b;

  
  --hairline: rgba(255, 255, 255, 0.06);
  --hairline-strong: rgba(255, 255, 255, 0.10);
  --hairline-accent: rgba(88, 101, 242, 0.30);
  --highlight-inset: rgba(255, 255, 255, 0.04);
  --drop: rgba(0, 0, 0, 0.45);

  
  --text-primary: #dbdee1;
  --text-secondary: #949ba4;
  --text-muted: #6b6f76;

  
  --accent: #5865f2;
  --accent-soft: rgba(88, 101, 242, 0.15);
  --focus-ring: rgba(88, 101, 242, 0.55);

  
  --radius-card: 14px;
  --radius-btn: 10px;
  --radius-chip: 4px;
  --radius-pill: 999px;

  
  --shadow-card: 0 4px 16px -4px var(--drop), 0 1px 0 var(--highlight-inset) inset;
  --shadow-pill: 0 1px 2px var(--drop), 0 1px 0 rgba(255, 255, 255, 0.08) inset;
  --shadow-modal: 0 24px 70px -16px rgba(0, 0, 0, 0.85), 0 1px 0 var(--highlight-inset) inset;

  
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  --sidebar-w: 300px;

  
  --scrollbar-thumb: #2b2d31;
  --scrollbar-thumb-hover: #3a3a44;
  --scrollbar-track: transparent;

  
  --bg-base: var(--surface-0);
  --bg-elevated: #000;
  --bg-hover: var(--surface-2);
  --bg-active: #2b2d31;
  --bg-highlight: #2a2a32;
  --divider: var(--hairline);
  --divider-strong: var(--hairline-strong);
  --radius-sm: var(--radius-btn);
  --radius-md: var(--radius-card);
  --radius-lg: var(--radius-card);
  --glass-fill: rgba(255, 255, 255, 0.03);
  --glass-fill-strong: rgba(255, 255, 255, 0.06);
  --glass-fill-hover: rgba(255, 255, 255, 0.09);
  --glass-border: var(--hairline);
  --glass-border-strong: var(--hairline-strong);
  --glass-shadow: var(--shadow-card);

  --font-stack: "gg sans", "ggsans", "Whitney", "Helvetica Neue", Helvetica, Arial,
    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
}

:root, body, #root {
  background: #000;
  color: var(--text-primary);
  margin: 0;
  height: 100%;
  font-family: var(--font-stack);
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
* { box-sizing: border-box; }
button, input { font-family: var(--font-stack); color: inherit; }
a { color: inherit; }


.sidebar-scroll, .mosaic, .search-overlay-body, .stats-body, .pane-body [data-virtuoso-scroller] {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}
.sidebar-scroll, .mosaic { scrollbar-gutter: stable; }
.sidebar-scroll::-webkit-scrollbar,
.mosaic::-webkit-scrollbar,
.search-overlay-body::-webkit-scrollbar,
.stats-body::-webkit-scrollbar { width: 10px; height: 10px; }
.pane-body [data-virtuoso-scroller]::-webkit-scrollbar { width: 12px; height: 12px; }
.sidebar-scroll::-webkit-scrollbar-track,
.mosaic::-webkit-scrollbar-track,
.search-overlay-body::-webkit-scrollbar-track,
.stats-body::-webkit-scrollbar-track,
.pane-body [data-virtuoso-scroller]::-webkit-scrollbar-track { background: transparent; }
.sidebar-scroll::-webkit-scrollbar-thumb,
.mosaic::-webkit-scrollbar-thumb,
.search-overlay-body::-webkit-scrollbar-thumb,
.stats-body::-webkit-scrollbar-thumb,
.pane-body [data-virtuoso-scroller]::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.sidebar-scroll::-webkit-scrollbar-thumb:hover,
.mosaic::-webkit-scrollbar-thumb:hover,
.search-overlay-body::-webkit-scrollbar-thumb:hover,
.stats-body::-webkit-scrollbar-thumb:hover,
.pane-body [data-virtuoso-scroller]::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
  background-clip: content-box;
}


.mobile-nav-icon svg { width: 22px; height: 22px; }
.stats-link svg { width: 18px; height: 18px; }
.mobile-back svg { width: 14px; height: 14px; }
.lightbox-nav svg { width: 18px; height: 18px; }
.play-overlay svg { width: 32px; height: 32px; }
.logout-btn svg { width: 16px; height: 16px; }
.lightbox-close svg { width: 16px; height: 16px; }
.search-overlay-close svg { width: 14px; height: 14px; }
.dropzone-logo {
  width: 40px;
  height: 40px;
  display: block;
  margin: 0 auto 18px;
  color: var(--text-primary);
}


.root {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  height: 100vh;
  overflow: hidden;
  background: var(--surface-0);
}


.dropzone {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-8);
  background: #000;
}
.dropzone-card {
  position: relative;
  background: rgba(20, 20, 24, 0.55);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  backdrop-filter: blur(14px) saturate(140%);
  border: 2px dotted var(--hairline-strong);
  border-radius: var(--radius-card);
  padding: 48px 56px;
  text-align: center;
  width: 400px;
  max-width: 100%;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: background 220ms var(--ease-standard), border-color 220ms var(--ease-standard);
}
.dropzone.dragover .dropzone-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.20);
}
.dropzone-headline {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0 0 10px;
  color: var(--text-primary);
}
.dropzone-subhead {
  font-size: 13px;
  margin: 0 auto 28px;
  max-width: 320px;
  line-height: 1.5;
  color: var(--text-secondary);
}
.dropzone-hint {
  font-size: 12.5px;
  margin: 14px 0 0;
  color: var(--text-muted);
}
.dropzone-button {
  display: inline-block;
  padding: 8px 18px;
  border: 1px solid var(--accent);
  border-radius: var(--radius-btn);
  background: var(--accent);
  color: #fff;
  font-family: var(--font-stack);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  box-shadow: var(--shadow-pill);
  transition: filter 160ms var(--ease-standard), transform 120ms var(--ease-standard);
}
.dropzone-button:hover { filter: brightness(1.08); }
.dropzone-button:active { transform: translateY(0); }
.dropzone-button:focus-visible {
  outline: none;
  box-shadow: var(--shadow-pill), 0 0 0 2px var(--focus-ring);
}
.dropzone-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin-bottom: var(--space-3);
}
.dropzone-status-phase {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: -0.005em;
}
.dropzone-status-detail {
  font-size: 11.5px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.015em;
}
.dropzone-error { margin-top: var(--space-4); font-size: 13px; color: var(--text-secondary); }
.dropzone-error button {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-btn);
  color: var(--text-primary);
  margin-left: var(--space-2);
  padding: 4px 12px;
  cursor: pointer;
  box-shadow: var(--shadow-pill);
  transition: background 160ms var(--ease-standard), transform 120ms var(--ease-standard);
}
.dropzone-error button:hover { background: rgba(255, 255, 255, 0.10); transform: translateY(-0.5px); }
.dropzone-error button:active { transform: translateY(0); }

.progress {
  width: 100%;
  max-width: 280px;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-pill);
  margin: var(--space-3) auto 0;
  overflow: hidden;
}
.progress > div { height: 100%; background: var(--accent); border-radius: inherit; transition: width 120ms linear; }

.corner-links {
  position: fixed;
  right: 18px;
  bottom: 18px;
  display: inline-flex;
  align-items: center;
  padding: 4px;
  gap: 2px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--hairline-strong);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  backdrop-filter: blur(14px) saturate(140%);
  box-shadow: var(--shadow-pill);
  z-index: 5;
}
.corner-link {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  color: var(--text-secondary);
  text-decoration: none;
  transition: background 160ms var(--ease-standard), color 160ms var(--ease-standard), transform 120ms var(--ease-standard);
}
.corner-link:hover {
  background: rgba(255, 255, 255, 0.10);
  transform: translateY(-0.5px);
  color: var(--text-primary);
}
.corner-link svg { width: 22px; height: 22px; }

@media (max-width: 768px) {
  .dropzone { padding: var(--space-4); }
  .dropzone-card {
    width: 100%;
    max-width: 360px;
    padding: 28px 24px;
  }
  .dropzone-logo {
    width: 32px; height: 32px;
    margin: 0 auto 12px;
  }
  .dropzone-headline { font-size: 18px; margin: 0 0 8px; }
  .dropzone-subhead { font-size: 12.5px; margin: 0 auto 20px; max-width: 280px; }
  .dropzone-button { font-size: 12.5px; padding: 7px 16px; }
  .dropzone-hint { font-size: 11.5px; margin: 12px 0 0; }
  .corner-links { right: 12px; bottom: 12px; }
  .corner-link { width: 28px; height: 28px; }
  .corner-link svg { width: 20px; height: 20px; }
}


.sidebar {
  display: flex; flex-direction: column;
  background: var(--bg-elevated);
  border-right: 1px solid var(--divider);
  overflow: hidden;
  min-width: 0;
  position: relative;
}
.sidebar-header {
  display: flex; align-items: center; gap: var(--space-2);
  padding: 14px 14px 10px;
}
.search-wrap {
  position: relative;
  flex: 1;
  display: flex; align-items: center;
  min-width: 0;
}
.sidebar-search {
  flex: 1;
  padding: 9px 14px;
  background: var(--surface-2);
  color: var(--text-primary);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-btn);
  outline: none;
  font-size: 13.5px;
  min-width: 0;
  box-shadow: var(--shadow-pill);
  transition: border-color 160ms var(--ease-standard), box-shadow 160ms var(--ease-standard), background 160ms var(--ease-standard);
}
.sidebar-search:hover { background: rgba(255, 255, 255, 0.04); }
.sidebar-search::placeholder { color: var(--text-muted); }
.sidebar-search:focus {
  
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--hairline-strong);
  box-shadow: var(--shadow-pill);
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--hairline);
  padding: 0 var(--space-2);
  gap: 2px;
  flex-shrink: 0;
}
.sidebar-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 6px 8px;
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  margin-bottom: -1px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  transition: color 140ms var(--ease-standard), border-color 140ms var(--ease-standard);
  cursor: pointer;
  text-transform: none;
  letter-spacing: 0;
}
.sidebar-tab:hover { color: var(--text-primary); }
.sidebar-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
.sidebar-tab-count {
  display: inline-block;
  min-width: 18px;
  padding: 1px 5px;
  background: var(--bg-base);
  border-radius: 999px;
  font-size: 10px;
  color: var(--text-muted);
}
.sidebar-tab.active .sidebar-tab-count {
  background: var(--accent-soft);
  color: var(--accent);
}

.chip:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.chip {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-pill);
  padding: 5px 14px;
  font-size: 13px;
  line-height: 1.3;
  cursor: pointer;
  box-shadow: var(--shadow-pill);
  transition: background 160ms var(--ease-standard), color 160ms var(--ease-standard), transform 120ms var(--ease-standard);
}
.chip:not(:disabled):hover { background: rgba(255, 255, 255, 0.10); color: var(--text-primary); transform: translateY(-0.5px); }
.chip:not(:disabled):active { transform: translateY(0); }
.chip.active {
  background: #1b1d41;
  border-color: rgba(88, 101, 242, 0.55);
  color: #94a8ff;
  box-shadow: var(--shadow-pill), 0 0 0 1px rgba(88, 101, 242, 0.20) inset;
}
.chip.active:not(:disabled):hover {
  background: #21245a;
  color: #b0bfff;
}

.sidebar-scroll {
  flex: 1; min-height: 0;
  overflow-y: auto;
  padding: var(--space-2) var(--space-2) var(--space-3);
}
.sidebar-body {
  position: relative;
  flex: 1; min-height: 0;
  display: flex; flex-direction: column;
}

.search-overlay-wrap {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  pointer-events: none;
}
.search-overlay-wrap > * { pointer-events: auto; }
.pane-search-overlay-wrap { z-index: 6; }
.search-overlay {
  position: absolute;
  inset: 0;
  display: flex; flex-direction: column;
  background: var(--surface-1);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  z-index: 4;
}
.search-overlay-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px var(--space-3) 8px;
  border-bottom: 1px solid var(--hairline);
  flex-shrink: 0;
}
.search-overlay-title {
  font-size: 11.5px;
  letter-spacing: 0;
  color: var(--text-muted);
  font-weight: 500;
}
.search-overlay-close {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px;
  border: 1px solid var(--hairline-strong);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  border-radius: var(--radius-btn);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--shadow-pill);
  transition: background 160ms var(--ease-standard), color 160ms var(--ease-standard), transform 120ms var(--ease-standard);
}
.search-overlay-close:hover { background: rgba(255, 255, 255, 0.10); color: var(--text-primary); transform: translateY(-0.5px); }
.search-overlay-close:active { transform: translateY(0); }
.search-overlay-body {
  flex: 1; min-height: 0;
  overflow-y: auto;
}

.row {
  position: relative;
  display: flex; align-items: center; gap: 12px;
  padding: 9px 12px;
  margin: 1px 0;
  cursor: pointer;
  border-radius: var(--radius-btn);
  background: transparent;
  border: none;
  color: var(--text-primary);
  font: inherit;
  text-align: left;
  width: 100%;
  min-width: 0;
}
.row { transition: background-color 140ms var(--ease-standard), transform 120ms var(--ease-standard); }
@media (hover: hover) {
  .row:hover { background: rgba(255, 255, 255, 0.05); transform: translateY(-0.5px); }
  .row:active { transform: translateY(0); }
}
.row.active {
  background: var(--bg-active);
  transform: translateY(0);
}
.row.indent { padding-left: 28px; }
.row-avatar {
  width: 32px; height: 32px;
  flex-shrink: 0;
  background: var(--bg-active);
  object-fit: cover;
  border-radius: 50%;
}
.row-hash {
  width: 32px; text-align: center;
  font-size: 16px;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.row-text { min-width: 0; flex: 1; }
.row-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-sub { font-size: 12.5px; line-height: 1.35; color: var(--text-secondary); }

.server-row { padding: 9px 10px 9px 6px; }
.server-row .row-text { font-weight: 500; }
.server-chevron {
  width: 14px; flex-shrink: 0; color: var(--text-muted);
  display: inline-flex; align-items: center; justify-content: center;
}

.sidebar-footer {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--divider);
}
.sidebar-footer img {
  width: 32px; height: 32px;
  object-fit: cover;
  border-radius: 50%;
}


.sidebar-owner { display: none; }
.sidebar-owner img,
.sidebar-owner-avatar-fallback {
  width: 34px; height: 34px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-active);
  flex-shrink: 0;
}
.sidebar-owner-text,
.sidebar-footer-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.sidebar-owner-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.sidebar-owner-meta {
  font-size: 11.5px;
  color: var(--text-secondary);
  line-height: 1.25;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sidebar-footer-meta {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.25;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.logout-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: auto;
  flex-shrink: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-btn);
  color: var(--text-muted);
  cursor: pointer;
  transition:
    color 140ms var(--ease-standard),
    background-color 140ms var(--ease-standard),
    border-color 140ms var(--ease-standard),
    transform 120ms var(--ease-standard);
}
.logout-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--hairline-strong);
  transform: translateY(-0.5px);
}
.logout-btn:active { transform: translateY(0); }
.sidebar-footer .name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.sidebar-empty {
  padding: var(--space-6) var(--space-4);
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
}


.results-list { padding: var(--space-2) var(--space-2); }
.results-empty {
  padding: var(--space-5) var(--space-4);
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
}
.result-group {
  margin-bottom: var(--space-3);
}
.result-group-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-2) var(--space-3) var(--space-1);
  font-size: 11.5px;
  letter-spacing: 0;
  color: var(--text-muted);
  font-weight: 500;
}
.result-hit {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: var(--radius-btn);
  padding: 10px 12px;
  cursor: pointer;
  color: var(--text-primary);
  font: inherit;
  transition: background-color 140ms var(--ease-standard), transform 120ms var(--ease-standard);
}
.result-hit:hover { background: rgba(255, 255, 255, 0.05); transform: translateY(-0.5px); }
.result-hit:active { transform: translateY(0); }
.result-hit-snippet {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-secondary);
}
.result-hit-snippet mark {
  background: rgba(88, 101, 242, 0.12);
  color: var(--text-primary);
  border-radius: var(--radius-chip);
  padding: 0 5px;
}
.result-hit-meta {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}
.results-more {
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
}
.results-more:hover { color: var(--text-secondary); }


.pane-swap {
  
  position: relative;
  display: flex; flex-direction: column;
  min-width: 0; min-height: 0;
  overflow: hidden;
  height: 100%;
  will-change: transform, opacity;
}
.pane {
  display: flex; flex-direction: column;
  overflow: hidden;
  min-width: 0; min-height: 0;
  flex: 1;
  background: var(--bg-base);
}
.pane-empty {
  padding: var(--space-8);
  color: var(--text-secondary);
  text-align: center;
}
.pane-empty-conv {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.pane-empty-icon-wrap {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--hairline);
  color: var(--text-muted);
}
.pane-empty-icon-wrap svg {
  width: 28px;
  height: 28px;
}
.pane-empty-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: -0.005em;
}
.pane-empty-sub {
  font-size: 12.5px;
  color: var(--text-muted);
}
.pane-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--divider);
  flex-shrink: 0;
}
.pane-header-left { display: flex; align-items: center; gap: var(--space-3); min-width: 0; flex: 1; }
.pane-header-left > div { min-width: 0; flex: 1; }
.pane-title {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pane-meta {
  font-size: 12.5px;
  color: var(--text-secondary);
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pane-gallery-toggle {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-pill);
  color: var(--text-primary);
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: var(--shadow-pill);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  transition: background 160ms var(--ease-standard), border-color 160ms var(--ease-standard), color 160ms var(--ease-standard), transform 120ms var(--ease-standard);
}
.pane-gallery-toggle:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.16);
  transform: translateY(-0.5px);
}
.pane-gallery-toggle:not(:disabled):active { transform: translateY(0); }
.pane-body { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.message-list { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.message-list > [data-virtuoso-scroller] { flex: 1; }


.sidebar-header.pane-search {
  padding: 10px var(--space-6) 8px;
  flex-shrink: 0;
}
@media (min-width: 769px) {
  .sidebar-header.pane-search { display: none; }
}


.sidebar-header.pane-search-inline {
  flex-shrink: 0;
  width: 240px;
  padding: 0;
}
.sidebar-header.pane-search-inline .search-wrap { width: 100%; }
.sidebar-header.pane-search-inline .sidebar-search { width: 100%; }
@media (max-width: 768px) {
  .sidebar-header.pane-search-inline { display: none; }
  
  .pane-body.gallery-open > .sidebar-header.pane-search { display: none; }
}
.search-overlay.pane-search-overlay {
  position: absolute;
  inset: 0;
  z-index: 6;
}
.pane-body { position: relative; }

.pane-fader {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.timeline-end {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px var(--space-8) 20px;
  color: var(--text-muted);
  user-select: none;
}
.timeline-end-rule {
  flex: 1;
  height: 1px;
  background: var(--hairline);
}
.timeline-end-label {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  font-size: 12.5px;
  white-space: nowrap;
}
.timeline-end-date {
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
}

.msg {
  display: flex; gap: var(--space-3);
  padding: 10px var(--space-6);
  transition: background-color 100ms var(--ease-standard);
}
.msg:hover { background: rgba(255, 255, 255, 0.04); }

@keyframes msg-jump-pulse {
  0%   { background: var(--accent-soft); }
  100% { background: rgba(255, 255, 255, 0.06); }
}
.msg.highlight {
  background: rgba(255, 255, 255, 0.06);
  animation: msg-jump-pulse 700ms ease-out;
}
.msg.highlight:hover { background: rgba(255, 255, 255, 0.10); }
.msg-avatar {
  width: 36px; height: 36px;
  background: var(--bg-active);
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: none;
}
.msg-body { flex: 1; min-width: 0; }
.msg-meta { display: flex; gap: var(--space-2); align-items: baseline; }
.msg-author { font-weight: 600; }
.msg-ts { font-size: 12px; color: var(--text-secondary); }
.msg-rel { font-size: 11px; color: var(--text-muted); }
.msg-content {
  white-space: pre-wrap;
  word-break: break-word;
  margin-top: 2px;
  line-height: 1.45;
}
.msg-content mark {
  background: rgba(88, 101, 242, 0.12);
  color: var(--text-primary);
  border-radius: var(--radius-chip);
  padding: 0 5px;
}
.skel {
  display: inline-block;
  vertical-align: -0.15em;
  height: 0.9em;
  background: rgba(148, 155, 164, 0.28);
  border-radius: var(--radius-pill);
  max-width: 100%;
}
.msg-attachments {
  display: flex; flex-direction: column; gap: var(--space-1);
  margin-top: var(--space-1);
}
.msg-attachment-trigger {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: block;
  border-radius: var(--radius-md);
  overflow: hidden;
  width: fit-content;
  max-width: 100%;
}
.msg-attachment-trigger:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.msg-attachments img,
.msg-attachments video {
  max-width: 360px;
  max-height: 240px;
  display: block;
  border-radius: var(--radius-btn);
  object-fit: cover;
}
.msg-attachment-video {
  position: relative;
}
.msg-attachment-video::after {
  content: "▶";
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}
.msg-link { color: var(--accent); text-decoration: none; }
.msg-link:hover { text-decoration: underline; }
.mention {
  color: #94a8ff;
  background: #1b1d41;
  padding: 1px 6px;
  border-radius: var(--radius-chip);
  font-weight: 500;
}


.gallery {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  position: relative;
}
.media-toggle {
  display: flex; gap: 8px;
  padding: 12px var(--space-4) 8px;
  flex-shrink: 0;
}

.mosaic {
  flex: 1; min-height: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-auto-rows: 180px;
  grid-auto-flow: dense;
  gap: 6px;
  padding: var(--space-3);
  overflow-y: auto;
}
.mosaic .tile {
  position: relative;
  padding: 0;
  border: none;
  background: var(--bg-active);
  cursor: pointer;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-md);
}
.mosaic img,
.mosaic video,
.video-placeholder {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}
.video-placeholder {
  background: #000;
}
.video-tile .play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transition: opacity 160ms var(--ease-standard);
}
.video-tile .play-overlay svg {
  width: 36px; height: 36px;
  color: rgba(255,255,255,0.95);
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
}
@media (hover: hover) {
  .video-tile:hover .play-overlay { opacity: 0; }
}


@keyframes app-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}
@keyframes row-roll-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.sidebar-scroll > * {
  animation: row-roll-in 260ms cubic-bezier(0.4, 0, 0.2, 1) both;
}
.sidebar-scroll > *:nth-child(1)  { animation-delay: 0ms; }
.sidebar-scroll > *:nth-child(2)  { animation-delay: 18ms; }
.sidebar-scroll > *:nth-child(3)  { animation-delay: 36ms; }
.sidebar-scroll > *:nth-child(4)  { animation-delay: 54ms; }
.sidebar-scroll > *:nth-child(5)  { animation-delay: 72ms; }
.sidebar-scroll > *:nth-child(6)  { animation-delay: 90ms; }
.sidebar-scroll > *:nth-child(7)  { animation-delay: 108ms; }
.sidebar-scroll > *:nth-child(8)  { animation-delay: 126ms; }
.sidebar-scroll > *:nth-child(9)  { animation-delay: 144ms; }
.sidebar-scroll > *:nth-child(10) { animation-delay: 162ms; }
.sidebar-scroll > *:nth-child(11) { animation-delay: 180ms; }
.sidebar-scroll > *:nth-child(12) { animation-delay: 198ms; }
.sidebar-scroll > *:nth-child(n+13) { animation-delay: 216ms; }
@media (prefers-reduced-motion: reduce) {
  .sidebar-scroll > * { animation: none; }
}
.spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--hairline-strong);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spinner-rotate 700ms linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .spinner { animation-duration: 1800ms; }
}
.fade-in {
  animation: app-fade-in 140ms var(--ease-standard) both;
}
@media (prefers-reduced-motion: reduce) {
  .fade-in { animation: none; }
}


.mobile-nav {
  display: none;
}
@media (max-width: 768px) {
  .mobile-nav {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    position: fixed;
    left: 0; right: 0; bottom: 0;
    height: calc(58px + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: rgba(8, 8, 10, 0.85);
    border-top: 1px solid var(--hairline);
    -webkit-backdrop-filter: blur(14px) saturate(140%);
    backdrop-filter: blur(14px) saturate(140%);
    z-index: 20;
  }
  .mobile-nav-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 6px 4px 8px;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font: inherit;
    transition: color 120ms var(--ease-standard);
    min-width: 0;
  }
  .mobile-nav-btn:hover { color: var(--text-secondary); }
  .mobile-nav-btn.active { color: var(--accent); }
  .mobile-nav-btn.active::before {
    content: "";
    position: absolute;
    top: 0;
    left: 30%;
    right: 30%;
    height: 2px;
    background: var(--accent);
    border-radius: 0 0 2px 2px;
  }
  .mobile-nav-icon {
    display: inline-flex;
    width: 20px;
    height: 20px;
  }
  .mobile-nav-icon svg { width: 100%; height: 100%; }
  .mobile-nav-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.01em;
  }
}


.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px var(--space-6) 64px;
  background: rgba(0, 0, 0, 0.94);
  cursor: zoom-out;
}
.lightbox-frame {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  min-height: 0;
  min-width: 0;
}
.lightbox-frame img,
.lightbox-frame video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-modal);
  background: #000;
}
.lightbox-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 1;
}
.lightbox-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-pill);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  backdrop-filter: blur(14px) saturate(140%);
  box-shadow: var(--shadow-pill);
  transition: background 160ms var(--ease-standard), transform 120ms var(--ease-standard);
}
.lightbox-action:hover { background: rgba(255, 255, 255, 0.10); transform: translateY(-0.5px); }
.lightbox-action:active { transform: translateY(0); }
.lightbox-close {
  width: 38px;
  height: 38px;
  padding: 0;
  flex-shrink: 0;
}
.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px; height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-pill);
  color: var(--text-primary);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  z-index: 1;
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  backdrop-filter: blur(14px) saturate(140%);
  box-shadow: var(--shadow-pill);
  transition: background 160ms var(--ease-standard), transform 120ms var(--ease-standard);
}
.lightbox-nav:hover { background: rgba(255, 255, 255, 0.10); }
.lightbox-nav:active { transform: translateY(-50%) scale(0.97); }
.lightbox-nav svg { width: 20px; height: 20px; display: block; }
.lightbox-nav-prev { left: 12px; }
.lightbox-nav-next { right: 12px; }
.lightbox-caption {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-pill);
  font-size: 12.5px;
  color: var(--text-secondary);
  max-width: 70%;
  cursor: default;
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  backdrop-filter: blur(14px) saturate(140%);
  box-shadow: var(--shadow-pill);
}
.lightbox-caption-avatar {
  width: 24px; height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--bg-active);
}
.lightbox-caption-meta {
  display: flex; flex-direction: column;
  min-width: 0;
}
.lightbox-caption-author {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lightbox-caption-date {
  font-size: 11.5px;
  color: var(--text-secondary);
  line-height: 1.2;
}
.lightbox-caption-name {
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 1px solid var(--hairline-strong);
  padding-left: 10px;
  margin-left: 2px;
}
.lightbox-caption-pos {
  color: var(--text-muted);
  flex-shrink: 0;
}


:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}


.mobile-back {
  display: none;
  width: 34px; height: 34px;
  align-items: center; justify-content: center;
  background: var(--glass-fill-strong);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  color: var(--text-primary);
  cursor: pointer;
  flex-shrink: 0;
}
.mobile-back svg { width: 14px; height: 14px; }

@media (max-width: 768px) {
  
  .sidebar,
  .sidebar-header,
  .conv-row,
  .sidebar-tabs button,
  .sidebar-tab,
  .stats-link {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }

  
  .sidebar-search {
    background: rgba(255, 255, 255, 0.10);
    border-color: var(--hairline-strong);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
    font-size: 13px;
  }
  .lightbox-action,
  .lightbox-nav {
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
  }
  .search-overlay-title { font-size: 11px; }

  .root {
    grid-template-columns: 1fr;
    position: relative;
  }
  .sidebar {
    width: 100%;
    padding-bottom: calc(58px + env(safe-area-inset-bottom, 0px));
  }
  .sidebar-header {
    
    padding: 10px 12px 10px;
  }
  
  .sidebar-tabs,
  .stats-link,
  .sidebar-footer { display: none; }

  
  .sidebar-owner {
    display: flex; align-items: center; gap: var(--space-3);
    padding: var(--space-4) var(--space-4) var(--space-3);
    width: 100%;
    border-bottom: 1px solid var(--hairline);
    margin-bottom: 8px;
  }

  
  .pane-swap {
    transform: none !important;
    will-change: opacity;
  }

  
  .pane {
    position: fixed; inset: 0;
    z-index: 10;
    background: var(--bg-base);
    transform: translateX(100%);
    transition: transform 260ms cubic-bezier(0.32, 0.72, 0, 1);
    pointer-events: none;
    padding-bottom: calc(58px + env(safe-area-inset-bottom, 0px));
  }
  .pane.open { transform: translateX(0); pointer-events: auto; }
  @media (prefers-reduced-motion: reduce) {
    .pane { transition: none; }
  }
  .mobile-back { display: inline-flex; }
  .dropzone-card { min-width: auto; width: 90%; padding: 32px 20px; }
  .pane-header { padding: 14px var(--space-4); }
  
  .pane-meta {
    display: block;
    font-size: 11px;
    margin-top: 2px;
    max-width: 60vw;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pane-gallery-toggle { padding: 6px 10px; font-size: 12px; }
  
  .sidebar-header.pane-search {
    padding: 12px 12px 12px;
  }
  .msg { padding: 10px var(--space-4); }
  .msg-attachments img, .msg-attachments video { max-width: 100%; max-height: 60vh; }
  .mosaic { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); grid-auto-rows: 110px; }

  
  .lightbox {
    padding: 12px 12px 56px;
    background: rgba(0, 0, 0, 0.98);
  }
  .lightbox-caption {
    bottom: 12px;
    left: 12px;
    right: 12px;
    transform: none;
    max-width: none;
    border-radius: var(--radius-md);
    padding: 8px 12px;
    gap: 10px;
  }
  .lightbox-caption-name { display: none; }
  .lightbox-caption-pos {
    margin-left: auto;
    font-size: 11px;
  }
  .lightbox-actions { gap: 6px; }
  .lightbox-action { padding: 6px 10px; font-size: 12px; }
  .lightbox-close { width: 36px; height: 36px; padding: 0; }
  .lightbox-nav { width: 36px; height: 36px; }

  
  .stats-body {
    padding: var(--space-4) var(--space-3) var(--space-6);
    gap: var(--space-5);
  }
  .stats-hero { gap: var(--space-3); }
  .stats-hero-avatar { width: 32px; height: 32px; }
  .stats-hero-name {
    font-size: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .stats-hero-meta { font-size: 12px; }
  .stats-trophy { padding: 12px 14px; gap: 10px; }
  .stats-trophy-icon { width: 22px; height: 22px; }
  .stats-trophy-meta { font-size: 13px; }
  .stats-trophy-preview { font-size: 12px; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .stats-card { padding: 10px 12px; min-width: 0; min-height: 52px; }
  .stats-card-value { font-size: 17px; }
  .stats-card-label { font-size: 11px; }
  .stats-card-suffix { font-size: 11px; }

  .stats-section-title { font-size: 11px; }

  .stats-top-row { grid-template-columns: 26px 1fr auto; gap: 10px; padding: 10px 8px; }
  .stats-top-bar-wrap { display: none; }
  .stats-top-avatar { width: 26px; height: 26px; }
  .stats-top-name { font-size: 13px; }
  .stats-top-sub { font-size: 11px; }
  .stats-top-count { font-size: 12px; }

  .stats-hist-bars { height: 100px; gap: 3px; }
  .stats-hist-axis { font-size: 10px; }
  
  .stats-hist .stats-hist-axis-dense { display: none; }
  .stats-hist .stats-hist-axis-sparse {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
    padding: 0 2px;
  }

  .stats-timeline { padding: 12px 12px 10px; }
  .stats-timeline-svg { height: 100px; }
  .stats-timeline-axis > span { font-size: 10px; }
  .stats-timeline-readout { font-size: 11px; }

  
  @media (max-width: 420px) {
    .stats-grid { grid-template-columns: 1fr; }
  }
}


.stats-link {
  display: flex;
  align-items: center;
  gap: 10px;
  
  margin: 4px 14px 6px;
  padding: 9px 12px;
  background: var(--glass-fill-strong);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn);
  color: var(--text-secondary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  backdrop-filter: blur(10px) saturate(140%);
  transition: background 160ms var(--ease-standard), color 160ms var(--ease-standard);
}
.stats-link:hover { background: var(--glass-fill-hover); color: var(--text-primary); }
.stats-link.active {
  
  background: rgba(88, 101, 242, 0.16);
  border-color: rgba(88, 101, 242, 0.40);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: var(--accent);
}
.stats-link svg { width: 14px; height: 14px; flex-shrink: 0; }

.stats-pane { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
.stats-body {
  flex: 1; min-height: 0;
  overflow-y: auto;
  padding: var(--space-6) var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.stats-hero {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.stats-hero-avatar {
  width: 56px; height: 56px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-active);
  flex-shrink: 0;
}
.stats-hero-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.stats-hero-name {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.stats-hero-meta {
  font-size: 13px;
  color: var(--text-muted);
}

.stats-trophy {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background: var(--surface-2);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: background 160ms var(--ease-standard),
              transform 160ms var(--ease-standard);
}
.stats-trophy:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-0.5px);
}
.stats-trophy:active { transform: translateY(0); }
.stats-trophy-icon {
  color: var(--text-primary);
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.stats-trophy-icon svg { width: 100%; height: 100%; }
.stats-trophy-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.stats-trophy-label {
  font-size: 11.5px;
  letter-spacing: 0;
  color: var(--text-muted);
  font-weight: 500;
}
.stats-trophy-meta {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stats-trophy-preview {
  font-size: 12.5px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stats-trophy-arrow {
  color: var(--text-muted);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.stats-trophy-arrow svg { width: 100%; height: 100%; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}
.stats-card {
  background: var(--surface-2);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 14px 16px;
}
.stats-card-label {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--text-muted);
}
.stats-card-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 6px;
  line-height: 1.2;
}
.stats-card-suffix {
  font-size: 12.5px;
  font-weight: 400;
  color: var(--text-secondary);
  margin-left: 2px;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.stats-section-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.stats-section-title {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--text-muted);
}
.stats-section-sub {
  font-size: 11.5px;
  color: var(--text-secondary);
}
.stats-empty {
  font-size: 13px;
  color: var(--text-muted);
  padding: var(--space-3) 0;
}

.stats-top {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stats-top-row {
  display: grid;
  grid-template-columns: 28px 1fr 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: var(--radius-btn);
  color: var(--text-primary);
  font: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 120ms var(--ease-standard), transform 120ms var(--ease-standard);
}
.stats-top-row:hover { background: rgba(255, 255, 255, 0.05); transform: translateY(-0.5px); }
.stats-top-row:active { transform: translateY(0); }
.stats-top-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-active);
}
.stats-top-name-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.stats-top-name {
  font-size: 13.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stats-top-sub {
  font-size: 11.5px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stats-top-bar-wrap {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.stats-top-bar {
  height: 100%;
  background: var(--accent);
  border-radius: inherit;
}
.stats-top-count {
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
  min-width: 56px;
  text-align: right;
}

.stats-hist {
  background: var(--surface-2);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 14px 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stats-hist-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
}
.stats-hist-bar-wrap {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
  min-width: 0;
}
.stats-hist-bar {
  width: 100%;
  background: var(--accent);
  border-radius: 2px 2px 0 0;
  min-height: 1px;
  opacity: 0.85;
  transition: opacity 120ms var(--ease-standard);
}
.stats-hist-bar-wrap:hover .stats-hist-bar { opacity: 1; }
.stats-hist-axis {
  display: flex;
  gap: 4px;
  font-size: 10px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.stats-hist-axis > span {
  flex: 1;
  text-align: center;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.stats-hist-axis > span.active { color: var(--text-primary); }


@media (min-width: 769px) {
  .stats-hist .stats-hist-axis-sparse { display: none; }
}


.stats-timeline {
  background: var(--surface-2);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 14px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stats-timeline-svg {
  width: 100%;
  height: 120px;
  display: block;
}
.stats-timeline-svg rect { transition: opacity 80ms var(--ease-standard); }
.stats-timeline-svg rect:hover { opacity: 1; }
.stats-timeline-axis {
  position: relative;
  height: 14px;
  margin-top: -8px;
}
.stats-timeline-axis > span {
  position: absolute;
  transform: translateX(-50%);
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
  white-space: nowrap;
}
.stats-timeline-readout {
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
}


@media (max-width: 768px) {
  .sidebar-tabs,
  .stats-link,
  .sidebar-footer { display: none; }
}
`;
