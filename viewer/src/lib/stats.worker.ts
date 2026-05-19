import { aggregateStats } from "./stats";
import type { IngestResult } from "../ingest/types";

const worker = self as unknown as Worker;

worker.onmessage = (e: MessageEvent<{ id: number; data: IngestResult }>) => {
  const { id, data } = e.data;
  try {
    const stats = aggregateStats(data);
    worker.postMessage({ id, stats });
  } catch (err) {
    worker.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
};
