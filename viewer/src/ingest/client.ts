import type { IngestResult, Message, Progress, WorkerOutbound } from "./types";
export function ingestPackage(file: File, onProgress: (p: Progress) => void, signal: AbortSignal): Promise<IngestResult> {
  return new Promise<IngestResult>((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("aborted"));
      return;
    }
    let worker: Worker;
    try {
      worker = new Worker(new URL("./ingest.worker.ts", import.meta.url), {
        type: "module"
      });
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
      return;
    }
    let settled = false;
    const cleanup = (): void => {
      worker.terminate();
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = (): void => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("aborted"));
    };
    signal.addEventListener("abort", onAbort);
    const messagesByChannel = new Map<string, Message[]>();
    worker.onmessage = (ev: MessageEvent<WorkerOutbound>) => {
      const msg = ev.data;
      if (msg.type === "progress") {
        onProgress(msg.progress);
        return;
      }
      if (msg.type === "channel") {
        messagesByChannel.set(msg.channelId, msg.messages);
        return;
      }
      if (msg.type === "done") {
        if (settled) return;
        settled = true;
        let ownerAvatarBlobUrl: string | null = null;
        if (msg.ownerAvatarBlob) {
          ownerAvatarBlobUrl = URL.createObjectURL(msg.ownerAvatarBlob);
        }
        const manifest = {
          ...msg.manifest,
          ownerAvatarPath: ownerAvatarBlobUrl ?? undefined
        };
        cleanup();
        resolve({
          manifest,
          messagesByChannel,
          ownerAvatarBlobUrl
        });
        return;
      }
      if (msg.type === "error") {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error(msg.message));
      }
    };
    worker.onerror = (ev: ErrorEvent) => {
      if (settled) return;
      settled = true;
      cleanup();
      const details = [ev.message, ev.filename, ev.lineno ? `line ${ev.lineno}` : ""].filter(Boolean).join(" ");
      reject(new Error(details));
    };
    worker.postMessage({
      type: "ingest",
      file
    });
  });
}
