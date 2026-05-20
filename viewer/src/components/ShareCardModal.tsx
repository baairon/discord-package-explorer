import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import { modalVariants } from "../lib/motion";
import {
  type ShareCardData,
  type ShareCardOrientation,
  renderShareCardCanvas,
  canvasToBlob,
  downloadBlob,
  shareCardFilename
} from "../lib/shareCard";
import { DownloadIcon, XIcon } from "./icons";

const PORTRAIT_MQ = "(max-width: 768px)";

function detectOrientation(): ShareCardOrientation {
  if (typeof window === "undefined") return "landscape";
  return window.matchMedia(PORTRAIT_MQ).matches ? "portrait" : "landscape";
}

interface ShareCardModalProps {
  data: ShareCardData;
  onClose: () => void;
}

export function ShareCardModal({ data, onClose }: ShareCardModalProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<"rendering" | "ready" | "error">("rendering");
  const [saving, setSaving] = useState(false);
  const [orientation, setOrientation] = useState<ShareCardOrientation>(detectOrientation);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(PORTRAIT_MQ);
    const update = () => setOrientation(mq.matches ? "portrait" : "landscape");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let mounted: HTMLCanvasElement | null = null;
    setStatus("rendering");
    renderShareCardCanvas(data, orientation)
      .then((canvas) => {
        if (cancelled) return;
        canvas.className = "share-card-canvas";
        const frame = frameRef.current;
        if (frame) {
          frame.appendChild(canvas);
          mounted = canvas;
        }
        canvasRef.current = canvas;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
      if (mounted && mounted.parentNode) mounted.parentNode.removeChild(mounted);
      canvasRef.current = null;
    };
  }, [data, orientation]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas || saving) return;
    setSaving(true);
    try {
      const blob = await canvasToBlob(canvas);
      downloadBlob(blob, shareCardFilename(data.ownerName));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <m.div
      className="share-card-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Share your Discord stats"
      onClick={onClose}
      variants={modalVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      <div className="share-card-actions">
        <button
          type="button"
          className="lightbox-action share-card-download"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          disabled={status !== "ready" || saving}
        >
          <DownloadIcon />
          <span>{saving ? "Saving" : "Download"}</span>
        </button>
        <button
          type="button"
          className="lightbox-action lightbox-close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close (Esc)"
          title="Close (Esc)"
        >
          <XIcon />
        </button>
      </div>

      <div
        className={`share-card-frame${orientation === "portrait" ? " portrait" : ""}`}
        ref={frameRef}
        onClick={(e) => e.stopPropagation()}
      >
        {status === "rendering" && <div className="spinner" role="status" aria-label="Rendering card" />}
        {status === "error" && (
          <div className="share-card-error">Could not render the card. Try again.</div>
        )}
      </div>
    </m.div>,
    document.body
  );
}
