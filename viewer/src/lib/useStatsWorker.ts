import { useEffect, useRef, useState } from "react";
import type { IngestResult } from "../ingest/types";
import type { Stats } from "./stats";

export function useStatsWorker(data: IngestResult) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState(true);
  const workerRef = useRef<Worker | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    const w = new Worker(new URL("./stats.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = w;
    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const w = workerRef.current;
    if (!w) return;
    const id = ++reqIdRef.current;
    setPending(true);
    const onMsg = (e: MessageEvent<{ id: number; stats?: Stats; error?: string }>) => {
      if (e.data.id !== id) return;
      if (e.data.stats) {
        setStats(e.data.stats);
        setPending(false);
      }
    };
    w.addEventListener("message", onMsg);
    w.postMessage({ id, data });
    return () => w.removeEventListener("message", onMsg);
  }, [data]);

  return { stats, pending };
}
