export type RawChannel = {
  id: string;
  type: "DM";
  recipients: [string, string];
} | {
  id: string;
  type: "GROUP_DM";
  name?: string | null;
  recipients?: string[];
  icon_hash?: string | null;
} | {
  id: string;
  type: "GUILD_TEXT";
  name?: string;
  guild?: {
    id: string;
    name: string;
  };
};
export interface RawMessage {
  ID: number;
  Timestamp: string;
  Contents: string;
  Attachments: string;
}
export type ConversationKind = "dm" | "group" | "server";
export type AttachmentKind = "image" | "video" | "audio" | "other";
export interface Attachment {
  url: string;
  filename: string;
  isImage: boolean;
  kind: AttachmentKind;
}
export interface Message {
  id: string;
  timestamp: number;
  contents: string;
  attachmentsRaw: string;
  authorId?: string;
}
export interface Participant {
  id: string;
  username?: string;
  avatarUrl: string;
  isOwner: boolean;
}
export interface ConversationSummary {
  id: string;
  kind: ConversationKind;
  displayName: string;
  participants: Participant[];
  messageCount: number;
  firstTs: number | null;
  lastTs: number | null;
  serverId?: string;
  serverName?: string;
}
export interface Manifest {
  ownerUserId: string;
  ownerDisplayName: string;
  ownerAvatarPath?: string;
  ownerCreatedAt: number | null;
  conversations: ConversationSummary[];
}
export interface IngestResult {
  manifest: Manifest;
  messagesByChannel: Map<string, Message[]>;
  ownerAvatarBlobUrl: string | null;
}
export type Phase = "extracting" | "reading-account" | "reading-activity" | "reading-channels" | "done";
export interface Progress {
  phase: Phase;
  pct: number;
  detail?: string;
}
export type WorkerInbound = {
  type: "ingest";
  file: File;
};
export type WorkerOutbound = {
  type: "progress";
  progress: Progress;
} | {
  type: "channel";
  channelId: string;
  messages: Message[];
} | {
  type: "done";
  manifest: Omit<Manifest, "ownerAvatarPath">;
  ownerAvatarBlob: Blob | null;
} | {
  type: "error";
  message: string;
};
