import type { IngestResult, Manifest, Message } from "../ingest/types";

interface SnapshotJson {
  manifest: Omit<Manifest, "ownerAvatarPath">;
  messagesByChannel: Record<string, Message[]>;
  ownerAvatarDataUrl: string | null;
}

export async function loadDemoSnapshot(): Promise<IngestResult> {
  const base = import.meta.env.BASE_URL ?? "/";
  const url = base.endsWith("/") ? `${base}demo-snapshot.json` : `${base}/demo-snapshot.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load demo snapshot: ${res.status}`);
  const json = (await res.json()) as SnapshotJson;
  return {
    manifest: {
      ...json.manifest,
      ownerAvatarPath: json.ownerAvatarDataUrl ?? undefined,
    },
    messagesByChannel: new Map(Object.entries(json.messagesByChannel)),
    ownerAvatarBlobUrl: json.ownerAvatarDataUrl,
  };
}
