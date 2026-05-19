import { useEffect } from "react";
import { formatShortDateTime } from "../lib/datetime";
import { highlightHTML } from "../lib/highlight";
import type { ResultGroup } from "../lib/search";
import { XIcon } from "./icons";
interface SearchResultsOverlayProps {
  results: ResultGroup[];
  query: string;
  className?: string;
  onJumpTo: (conversationId: string, messageId: string) => void;
  onClose: () => void;
}
export function SearchResultsOverlay({
  results,
  query,
  className,
  onJumpTo,
  onClose
}: SearchResultsOverlayProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const total = results.reduce((n, g) => n + g.totalHits, 0);
  return <div className={className ? `search-overlay fade-in ${className}` : "search-overlay fade-in"} role="dialog" aria-label="Search results">
      <div className="search-overlay-header">
        <span className="search-overlay-title">
          {total > 0 ? `${total.toLocaleString()} match${total === 1 ? "" : "es"}` : "No matches"}
        </span>
        <button type="button" className="search-overlay-close" onClick={onClose} aria-label="Close search results" title="Close (Esc)">
          <XIcon />
        </button>
      </div>
      <div className="search-overlay-body">
        {results.length === 0 ? <div className="results-empty">No matches.</div> : <div className="results-list">
            {results.map(g => <div key={g.conversationId} className="result-group">
                <div className="result-group-header">
                  <span>{g.conversationName}</span>
                  <span>{g.totalHits}</span>
                </div>
                {g.hits.map(h => <button key={h.messageId} className="result-hit" onClick={() => onJumpTo(g.conversationId, h.messageId)}>
                    <div className="result-hit-snippet" dangerouslySetInnerHTML={{
              __html: highlightHTML(h.snippet, query)
            }} />
                    <div className="result-hit-meta">
                      {formatShortDateTime(h.timestamp)}
                    </div>
                  </button>)}
                {g.totalHits > g.hits.length && <div className="results-more">
                    +{g.totalHits - g.hits.length} more
                  </div>}
              </div>)}
          </div>}
      </div>
    </div>;
}
