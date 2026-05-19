import { useCallback, useEffect, useRef, useState } from "react";
import { ingestPackage } from "../ingest/client";
import type { IngestResult, Phase, Progress } from "../ingest/types";
import { DiscordLogo } from "./icons";
export function DropZone({
  onIngested
}: {
  onIngested: (r: IngestResult) => void;
}) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const handleFile = useCallback((file: File) => {
    controllerRef.current?.abort();
    setError(null);
    const controller = new AbortController();
    controllerRef.current = controller;
    setProgress({
      phase: "extracting",
      pct: 0
    });
    ingestPackage(file, setProgress, controller.signal).then(r => {
      if (controller.signal.aborted) return;
      onIngested(r);
    }).catch((e: unknown) => {
      if (controller.signal.aborted) return;
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Couldn't load: ${msg}`);
      setProgress(null);
    });
  }, [onIngested]);
  useEffect(() => () => controllerRef.current?.abort(), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);
  return <div className={`dropzone fade-in${dragOver ? " dragover" : ""}`} onDragOver={e => {
    e.preventDefault();
    setDragOver(true);
  }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}>
      <div className="dropzone-card">
        <DiscordLogo />
        <h1 className="dropzone-headline">Discord Package Explorer</h1>
        <p className="dropzone-subhead">
          Browse your messages, DMs, attachments, and stats, all in your browser.
        </p>

        {progress ? <>
            <div className="dropzone-status">
              <div className="dropzone-status-phase">{phaseLabel(progress.phase)}</div>
              {progress.detail && <div className="dropzone-status-detail">{progress.detail}</div>}
            </div>
            <div className="progress">
              <div style={{
            width: `${progress.pct}%`
          }} />
            </div>
          </> : <>
            <label className="dropzone-button">
              Choose .zip
              <input type="file" accept=".zip" style={{
            display: "none"
          }} onChange={e => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }} />
            </label>
            <p className="dropzone-hint">or drop it anywhere</p>
          </>}
        {error && <div className="dropzone-error">
            {error}
            <button onClick={() => {
          controllerRef.current?.abort();
          setError(null);
          setProgress(null);
        }}>
              try again
            </button>
          </div>}
      </div>
    </div>;
}
function phaseLabel(p: Phase): string {
  switch (p) {
    case "extracting":
      return "Opening your package…";
    case "reading-account":
      return "Reading account…";
    case "reading-activity":
      return "Scanning Activity…";
    case "reading-channels":
      return "Reading channels…";
    case "done":
      return "Done";
  }
}
