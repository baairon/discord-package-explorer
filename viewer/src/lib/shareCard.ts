export interface ShareCardData {
  ownerName: string;
  ownerAvatarUrl: string | null;
  ownerCreatedAt: number | null;
  totalMessages: number;
  totalCharacters: number;
  peopleTalkedTo: number;
  longestStreak: number;
  dailyCounts: Map<string, number>;
  tagline: string | null;
}

export type ShareCardOrientation = "landscape" | "portrait";

export const SHARE_CARD_W = 1200;
export const SHARE_CARD_H = 630;
export const SHARE_CARD_PORTRAIT_W = 1080;
export const SHARE_CARD_PORTRAIT_H = 1920;

const BG_TOP = "#101015";
const BG_BOTTOM = "#070709";
const TILE_FILL = "#17171b";
const HAIRLINE = "rgba(255, 255, 255, 0.10)";
const HAIRLINE_SOFT = "rgba(255, 255, 255, 0.06)";
const HAIRLINE_GLASS = "rgba(255, 255, 255, 0.16)";
const TILE_BORDER = "rgba(255, 255, 255, 0.06)";
const GLASS_HIGHLIGHT = "rgba(255, 255, 255, 0.04)";
const HALO_RING = "rgba(255, 255, 255, 0.04)";
const TEXT_PRIMARY = "#dbdee1";
const TEXT_SECONDARY = "#949ba4";
const TEXT_MUTED = "#6b6f76";
const ACCENT = "#5865f2";
const ACCENT_FILL = "rgba(88, 101, 242, 0.18)";
const ACCENT_BORDER = "rgba(88, 101, 242, 0.22)";
const ACCENT_GLOW = "rgba(88, 101, 242, 0.16)";
const ACCENT_TRANSPARENT = "rgba(88, 101, 242, 0)";
const COOL_VIGNETTE = "rgba(88, 101, 242, 0.07)";
const ACCENT_FALLBACK_SOFT = "rgba(88, 101, 242, 0.18)";

const FONT = '"gg sans", "ggsans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

const DAY_MS = 86_400_000;
const YEAR_MS = 365.25 * DAY_MS;

const PAD_X = 56;
const PAD_TOP = 48;
const PAD_BOTTOM = 28;
const CARD_RADIUS = 28;

const AVATAR_SIZE = 96;
const HEADER_TOP = PAD_TOP;
const HEADER_BOTTOM = HEADER_TOP + AVATAR_SIZE;
const HEADER_CENTER = HEADER_TOP + AVATAR_SIZE / 2;

const TEXT_X = PAD_X + AVATAR_SIZE + 28;
const NAME_BASELINE = HEADER_TOP + 50;
const SUB_BASELINE = NAME_BASELINE + 28;

const MAIN_TOP = HEADER_BOTTOM + 20;
const SUPPORT_TILE_H = 60;
const SUPPORT_TILE_GAP = 12;
const MAIN_H = SUPPORT_TILE_H * 3 + SUPPORT_TILE_GAP * 2;
const MAIN_BOTTOM = MAIN_TOP + MAIN_H;

const ACTIVITY_TOP = MAIN_BOTTOM + 20;
const ACTIVITY_BOTTOM = SHARE_CARD_H - PAD_BOTTOM;
const ACTIVITY_H = ACTIVITY_BOTTOM - ACTIVITY_TOP;

const COL_GAP = 20;
const TOTAL_W = SHARE_CARD_W - PAD_X * 2;
const HERO_W = Math.round((TOTAL_W - COL_GAP) * (1.45 / 2.45));
const SUPPORT_W = TOTAL_W - COL_GAP - HERO_W;
const SUPPORT_X = PAD_X + HERO_W + COL_GAP;

const TILE_RADIUS = 20;
const SUPPORT_TILE_RADIUS = 16;
const HERO_PAD_X = 32;
const HERO_PAD_Y = 28;
const SUPPORT_PAD_X = 20;
const ACTIVITY_PAD_X = 28;
const ACTIVITY_PAD_Y = 22;
const ACTIVITY_AXIS_RESERVE = 18;

const JOIN_DATE_FMT = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric"
});
const COMPACT_FMT = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1
});

const P_PAD = 72;
const P_GAP = 44;
const P_CARD_RADIUS = 56;
const P_TILE_RADIUS = 32;

const P_PILL_TOP = P_PAD;
const P_PILL_H = 60;
const P_PILL_BOTTOM = P_PILL_TOP + P_PILL_H;

const P_IDENTITY_TOP = P_PILL_BOTTOM + P_GAP;
const P_AVATAR_SIZE = 168;
const P_AVATAR_TOP = P_IDENTITY_TOP;
const P_AVATAR_BOTTOM = P_AVATAR_TOP + P_AVATAR_SIZE;
const P_NAME_BASELINE = P_AVATAR_BOTTOM + 24 + 60;
const P_JOINED_BASELINE = P_NAME_BASELINE + 60;
const P_TAGLINE_BASELINE = P_JOINED_BASELINE + 42;
const P_IDENTITY_BOTTOM = P_TAGLINE_BASELINE + 6;

const P_HERO_TOP = P_IDENTITY_BOTTOM + P_GAP;
const P_HERO_H = 480;
const P_HERO_BOTTOM = P_HERO_TOP + P_HERO_H;

const P_SUPPORT_TOP = P_HERO_BOTTOM + P_GAP;
const P_SUPPORT_H = 200;
const P_SUPPORT_BOTTOM = P_SUPPORT_TOP + P_SUPPORT_H;

const P_ACTIVITY_TOP = P_SUPPORT_BOTTOM + P_GAP;
const P_ACTIVITY_H = 432;
const P_ACTIVITY_BOTTOM = P_ACTIVITY_TOP + P_ACTIVITY_H;

const P_HERO_PAD_X = 60;
const P_HERO_PAD_Y = 52;
const P_SUPPORT_GAP = 28;
const P_SUPPORT_PAD = 36;
const P_ACTIVITY_PAD_X = 48;
const P_ACTIVITY_PAD_Y = 40;
const P_ACTIVITY_AXIS_RESERVE = 32;

export async function renderShareCardCanvas(
  d: ShareCardData,
  orientation: ShareCardOrientation = "landscape"
): Promise<HTMLCanvasElement> {
  const portrait = orientation === "portrait";
  const W = portrait ? SHARE_CARD_PORTRAIT_W : SHARE_CARD_W;
  const H = portrait ? SHARE_CARD_PORTRAIT_H : SHARE_CARD_H;
  const radius = portrait ? P_CARD_RADIUS : CARD_RADIUS;

  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");
  ctx.scale(dpr, dpr);

  roundedRectPath(ctx, 0, 0, W, H, radius);
  ctx.clip();

  try { await document.fonts.ready; } catch {}

  const avatar = await loadAvatar(d.ownerAvatarUrl);

  if (portrait) {
    drawVignetteBackgroundPortrait(ctx);
    drawPortraitWordmark(ctx);
    drawPortraitIdentity(ctx, d, avatar);
    drawPortraitHero(ctx, d);
    drawPortraitSupport(ctx, d);
    drawPortraitActivity(ctx, d.dailyCounts);
  } else {
    drawVignetteBackground(ctx);
    drawHeaderHero(ctx, d, avatar);
    drawHeroTile(ctx, d);
    drawSupportStack(ctx, d);
    drawActivityTimeline(ctx, d.dailyCounts);
  }

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to encode canvas"));
      },
      "image/png",
      0.95
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function shareCardFilename(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "you";
  return `discord-stats-${slug}.png`;
}

function drawVignetteBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = BG_BOTTOM;
  ctx.fillRect(0, 0, SHARE_CARD_W, SHARE_CARD_H);

  const vert = ctx.createLinearGradient(0, 0, 0, SHARE_CARD_H);
  vert.addColorStop(0, BG_TOP);
  vert.addColorStop(0.35, BG_BOTTOM);
  vert.addColorStop(1, BG_BOTTOM);
  ctx.fillStyle = vert;
  ctx.fillRect(0, 0, SHARE_CARD_W, SHARE_CARD_H);

  const tr = ctx.createRadialGradient(
    SHARE_CARD_W * 0.88, -SHARE_CARD_H * 0.10, 0,
    SHARE_CARD_W * 0.88, -SHARE_CARD_H * 0.10, SHARE_CARD_W * 0.55
  );
  tr.addColorStop(0, ACCENT_GLOW);
  tr.addColorStop(1, ACCENT_TRANSPARENT);
  ctx.fillStyle = tr;
  ctx.fillRect(0, 0, SHARE_CARD_W, SHARE_CARD_H);

  const bl = ctx.createRadialGradient(
    -SHARE_CARD_W * 0.05, SHARE_CARD_H * 1.10, 0,
    -SHARE_CARD_W * 0.05, SHARE_CARD_H * 1.10, SHARE_CARD_W * 0.60
  );
  bl.addColorStop(0, COOL_VIGNETTE);
  bl.addColorStop(1, ACCENT_TRANSPARENT);
  ctx.fillStyle = bl;
  ctx.fillRect(0, 0, SHARE_CARD_W, SHARE_CARD_H);

  drawDotFieldBottomRight(ctx, SHARE_CARD_W, SHARE_CARD_H, 380, 380, 14, 1, 0, 0);

  ctx.strokeStyle = HAIRLINE_GLASS;
  ctx.lineWidth = 1;
  roundedRectPath(ctx, 0.5, 0.5, SHARE_CARD_W - 1, SHARE_CARD_H - 1, CARD_RADIUS - 0.5);
  ctx.stroke();

  drawTopHighlight(ctx, 0, 0, SHARE_CARD_W, CARD_RADIUS, 1);
}

function drawDotFieldBottomRight(
  ctx: CanvasRenderingContext2D,
  cardW: number,
  cardH: number,
  fieldW: number,
  fieldH: number,
  spacing: number,
  dotRadius: number,
  offsetRight: number,
  offsetBottom: number
) {
  const fieldRight = cardW + offsetRight;
  const fieldBottom = cardH + offsetBottom;
  const fieldLeft = fieldRight - fieldW;
  const fieldTop = fieldBottom - fieldH;
  const anchorX = fieldLeft + fieldW * 0.9;
  const anchorY = fieldTop + fieldH * 0.9;
  const maskR = fieldW * 0.6;
  const innerStop = maskR * 0.4;
  const outerStop = maskR;

  ctx.save();
  ctx.fillStyle = ACCENT;
  for (let y = fieldTop; y < fieldBottom; y += spacing) {
    for (let x = fieldLeft; x < fieldRight; x += spacing) {
      const dx = x - anchorX;
      const dy = y - anchorY;
      const d = Math.sqrt(dx * dx + dy * dy);
      let maskAlpha = 0;
      if (d <= innerStop) {
        maskAlpha = 1;
      } else if (d <= outerStop) {
        maskAlpha = 1 - (d - innerStop) / (outerStop - innerStop);
      } else {
        continue;
      }
      ctx.globalAlpha = maskAlpha * 0.16;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawHeaderHero(
  ctx: CanvasRenderingContext2D,
  d: ShareCardData,
  avatar: HTMLImageElement | null
) {
  const cx = PAD_X + AVATAR_SIZE / 2;
  const cy = HEADER_CENTER;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, AVATAR_SIZE / 2 + 4, 0, Math.PI * 2);
  ctx.strokeStyle = HALO_RING;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  drawAvatar(ctx, avatar, PAD_X, HEADER_TOP, AVATAR_SIZE, d.ownerName);

  const pillRight = SHARE_CARD_W - PAD_X;
  const pillLeft = drawWordmarkPill(ctx, pillRight, HEADER_CENTER);

  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `700 44px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const nameMax = pillLeft - 24 - TEXT_X;
  const name = truncate(ctx, d.ownerName || "You", Math.max(200, nameMax));
  ctx.fillText(name, TEXT_X, NAME_BASELINE);

  let subX = TEXT_X;
  if (d.ownerCreatedAt) {
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.font = `500 16px ${FONT}`;
    const joinedText = `Joined ${JOIN_DATE_FMT.format(new Date(d.ownerCreatedAt))}`;
    ctx.fillText(joinedText, subX, SUB_BASELINE);
    subX += ctx.measureText(joinedText).width;
  }
  if (d.tagline) {
    if (d.ownerCreatedAt) {
      ctx.fillStyle = TEXT_MUTED;
      ctx.beginPath();
      ctx.arc(subX + 10, SUB_BASELINE - 5, 2, 0, Math.PI * 2);
      ctx.fill();
      subX += 20;
    }
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.font = `italic 400 16px ${FONT}`;
    const tagMax = Math.max(120, pillLeft - 24 - subX);
    const tag = truncate(ctx, `"${d.tagline}"`, tagMax);
    ctx.fillText(tag, subX, SUB_BASELINE);
  }
}

function drawWordmarkPill(ctx: CanvasRenderingContext2D, rightX: number, centerY: number): number {
  const fontSize = 13;
  const padL = 12;
  const padR = 14;
  const padY = 8;
  const dotR = 3;
  const gap = 10;
  const headText = "discord";
  const tailText = ".bairon.dev";

  ctx.save();
  ctx.font = `600 ${fontSize}px ${FONT}`;
  const headW = ctx.measureText(headText).width;
  ctx.font = `500 ${fontSize}px ${FONT}`;
  const tailW = ctx.measureText(tailText).width;
  ctx.restore();

  const textW = headW + tailW;
  const pillW = padL + dotR * 2 + gap + textW + padR;
  const pillH = fontSize + padY * 2;
  const pillX = rightX - pillW;
  const pillY = centerY - pillH / 2;

  roundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = TILE_FILL;
  ctx.fill();
  ctx.strokeStyle = TILE_BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(pillX + padL + dotR, centerY, dotR, 0, Math.PI * 2);
  ctx.fill();

  const textBaseline = centerY + 5;
  const textStartX = pillX + padL + dotR * 2 + gap;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `600 ${fontSize}px ${FONT}`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.fillText(headText, textStartX, textBaseline);
  ctx.font = `500 ${fontSize}px ${FONT}`;
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.fillText(tailText, textStartX + headW, textBaseline);

  return pillX;
}

function drawHeroTile(ctx: CanvasRenderingContext2D, d: ShareCardData) {
  const x = PAD_X;
  const y = MAIN_TOP;
  const w = HERO_W;
  const h = MAIN_H;

  drawGlassTile(ctx, x, y, w, h, TILE_RADIUS);

  const innerL = x + HERO_PAD_X;
  const innerR = x + w - HERO_PAD_X;

  drawUppercaseLabel(ctx, innerL, y + HERO_PAD_Y + 8, "Messages sent");

  if (d.ownerCreatedAt) {
    const years = Math.max(1, Math.round((Date.now() - d.ownerCreatedAt) / YEAR_MS));
    drawTrendChip(ctx, innerR, y + HERO_PAD_Y - 4, `active ${years} yr${years === 1 ? "" : "s"}`);
  }

  let captionBaseline = y + h - HERO_PAD_Y;
  const captionFontSize = 14;
  const showCaption = !!d.ownerCreatedAt && d.totalMessages > 0;
  if (showCaption) {
    const days = Math.max(1, Math.floor((Date.now() - d.ownerCreatedAt!) / DAY_MS));
    const avgPerDay = Math.max(1, Math.round(d.totalMessages / days));
    drawCaptionWithBold(
      ctx,
      innerL,
      captionBaseline,
      `That's roughly `,
      avgPerDay.toLocaleString(),
      ` a day, every day, since you joined.`,
      captionFontSize,
      innerR - innerL
    );
  }

  const valueFontSize = 64;
  const valueBaseline = showCaption
    ? captionBaseline - captionFontSize - 24
    : y + h - HERO_PAD_Y;

  setLetterSpacing(ctx, "-3px");
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `700 ${valueFontSize}px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const valueText = d.totalMessages.toLocaleString();
  ctx.fillText(valueText, innerL, valueBaseline);
  const valueW = ctx.measureText(valueText).width;
  setLetterSpacing(ctx, "0px");

  const sparkH = 28;
  const sparkX = innerL + valueW + 18;
  const sparkY = valueBaseline - sparkH;
  if (sparkX + 46 < innerR) {
    drawSparkline(ctx, sparkX, sparkY, sparkH, computeSparklinePoints(d.dailyCounts));
  }
}

function drawTrendChip(ctx: CanvasRenderingContext2D, rightX: number, topY: number, text: string) {
  const fontSize = 12;
  const padX = 10;
  const padY = 4;
  const iconW = 11;
  const iconGap = 6;

  ctx.save();
  ctx.font = `600 ${fontSize}px ${FONT}`;
  const textW = ctx.measureText(text).width;
  ctx.restore();

  const w = padX + iconW + iconGap + textW + padX;
  const h = fontSize + padY * 2 + 4;
  const x = rightX - w;
  const y = topY;

  roundedRectPath(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = ACCENT_FILL;
  ctx.fill();
  ctx.strokeStyle = ACCENT_BORDER;
  ctx.lineWidth = 1;
  roundedRectPath(ctx, x + 0.5, y + 0.5, w - 1, h - 1, (h - 1) / 2);
  ctx.stroke();

  const iconX = x + padX;
  const iconCy = y + h / 2;
  ctx.save();
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(iconX,         iconCy + 3);
  ctx.lineTo(iconX + 3.5,   iconCy);
  ctx.lineTo(iconX + 6,     iconCy + 2);
  ctx.lineTo(iconX + 10,    iconCy - 3.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(iconX + 10, iconCy - 3.5);
  ctx.lineTo(iconX + 7,  iconCy - 3.5);
  ctx.moveTo(iconX + 10, iconCy - 3.5);
  ctx.lineTo(iconX + 10, iconCy - 0.5);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = ACCENT;
  ctx.font = `600 ${fontSize}px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(text, iconX + iconW + iconGap, iconCy + 4);
}

function drawSparkline(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, points: number[]) {
  const barW = 4;
  const gap = 3;
  ctx.save();
  ctx.fillStyle = ACCENT;
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < points.length; i++) {
    const bh = Math.max(2, points[i] * h);
    const bx = x + i * (barW + gap);
    const by = y + (h - bh);
    roundedRectPath(ctx, bx, by, barW, bh, 1.5);
    ctx.fill();
  }
  ctx.restore();
}

function computeSparklinePoints(dailyCounts: Map<string, number>): number[] {
  if (dailyCounts.size === 0) return [0.3, 0.55, 0.42, 0.78, 0.65, 0.9, 0.72];
  let lastMs = 0;
  const entries: Array<[number, number]> = [];
  for (const [k, v] of dailyCounts) {
    const [y, m, d] = k.split("-").map(Number);
    const ms = Date.UTC(y, m - 1, d);
    entries.push([ms, v]);
    if (ms > lastMs) lastMs = ms;
  }
  const startMs = lastMs - 7 * 7 * DAY_MS;
  const buckets = [0, 0, 0, 0, 0, 0, 0];
  for (const [ms, v] of entries) {
    if (ms < startMs) continue;
    const i = Math.min(6, Math.max(0, Math.floor((ms - startMs) / (7 * DAY_MS))));
    buckets[i] += v;
  }
  const max = Math.max(...buckets, 1);
  return buckets.map(v => v / max);
}

function drawCaptionWithBold(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseline: number,
  prefix: string,
  bold: string,
  suffix: string,
  fontSize: number,
  maxW: number
) {
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `400 ${fontSize}px ${FONT}`;
  ctx.fillStyle = TEXT_SECONDARY;
  const prefixW = ctx.measureText(prefix).width;
  ctx.font = `600 ${fontSize}px ${FONT}`;
  const boldW = ctx.measureText(bold).width;
  ctx.font = `400 ${fontSize}px ${FONT}`;
  const suffixW = ctx.measureText(suffix).width;
  if (prefixW + boldW + suffixW > maxW) {
    const trimmed = truncate(ctx, suffix, Math.max(20, maxW - prefixW - boldW));
    ctx.fillText(prefix, x, baseline);
    ctx.font = `600 ${fontSize}px ${FONT}`;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.fillText(bold, x + prefixW, baseline);
    ctx.font = `400 ${fontSize}px ${FONT}`;
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.fillText(trimmed, x + prefixW + boldW, baseline);
    return;
  }
  ctx.fillText(prefix, x, baseline);
  ctx.font = `600 ${fontSize}px ${FONT}`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.fillText(bold, x + prefixW, baseline);
  ctx.font = `400 ${fontSize}px ${FONT}`;
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.fillText(suffix, x + prefixW + boldW, baseline);
}

function drawSupportStack(ctx: CanvasRenderingContext2D, d: ShareCardData) {
  const novels = d.totalCharacters >= 800_000 ? Math.round(d.totalCharacters / 800_000) : 0;
  const tiles: Array<{ label: string; value: string; unit: string; glow?: boolean }> = [
    {
      label: "Characters typed",
      value: COMPACT_FMT.format(d.totalCharacters),
      unit: novels >= 1 ? `≈ ${novels} novel${novels === 1 ? "" : "s"}` : ""
    },
    {
      label: "People you talked to",
      value: d.peopleTalkedTo.toLocaleString(),
      unit: "across all chats"
    },
    {
      label: "Best message streak",
      value: d.longestStreak.toLocaleString(),
      unit: "days",
      glow: true
    }
  ];

  for (let i = 0; i < tiles.length; i++) {
    const y = MAIN_TOP + i * (SUPPORT_TILE_H + SUPPORT_TILE_GAP);
    drawSupportTile(ctx, SUPPORT_X, y, SUPPORT_W, SUPPORT_TILE_H, tiles[i]);
  }
}

function drawSupportTile(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  t: { label: string; value: string; unit: string; glow?: boolean }
) {
  drawGlassTile(ctx, x, y, w, h, SUPPORT_TILE_RADIUS);

  drawUppercaseLabel(ctx, x + SUPPORT_PAD_X, y + 18, t.label);

  const valueBaseline = y + h - 14;
  setLetterSpacing(ctx, "-0.5px");
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `700 22px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(t.value, x + SUPPORT_PAD_X, valueBaseline);
  const valueW = ctx.measureText(t.value).width;
  setLetterSpacing(ctx, "0px");

  if (t.glow) {
    const cx = x + SUPPORT_PAD_X + valueW + 12;
    const cy = valueBaseline - 6;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
    grad.addColorStop(0, ACCENT_GLOW);
    grad.addColorStop(1, ACCENT_TRANSPARENT);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (t.unit) {
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = `500 12px ${FONT}`;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "right";
    ctx.fillText(t.unit, x + w - SUPPORT_PAD_X, valueBaseline);
    ctx.textAlign = "left";
  }
}

function drawActivityTimeline(ctx: CanvasRenderingContext2D, dailyCounts: Map<string, number>) {
  const tileX = PAD_X;
  const tileY = ACTIVITY_TOP;
  const tileW = TOTAL_W;
  const tileH = ACTIVITY_H;

  drawGlassTile(ctx, tileX, tileY, tileW, tileH, TILE_RADIUS);

  const headerBaseline = tileY + ACTIVITY_PAD_Y + 8;
  drawUppercaseLabel(ctx, tileX + ACTIVITY_PAD_X, headerBaseline, "Activity over time");

  let peakMs = 0;
  let peakCount = 0;
  for (const [k, v] of dailyCounts) {
    if (v > peakCount) {
      peakCount = v;
      const [y, m, d] = k.split("-").map(Number);
      peakMs = Date.UTC(y, m - 1, d);
    }
  }

  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.font = `500 11px ${FONT}`;
  ctx.fillStyle = TEXT_MUTED;
  setLetterSpacing(ctx, "0.6px");
  let rightX = tileX + tileW - ACTIVITY_PAD_X;
  if (peakCount > 0) {
    const peakDate = JOIN_DATE_FMT.format(new Date(peakMs));
    const peakLabel = `PEAK · ${peakCount.toLocaleString()} ON ${peakDate.toUpperCase()}`;
    ctx.fillText(peakLabel, rightX, headerBaseline);
    rightX -= ctx.measureText(peakLabel).width + 18;
  }
  const legendText = "MESSAGES / DAY";
  const legendTextW = ctx.measureText(legendText).width;
  ctx.fillText(legendText, rightX, headerBaseline);
  setLetterSpacing(ctx, "0px");

  const legendSquareX = rightX - legendTextW - 6 - 8;
  const legendSquareY = headerBaseline - 9;
  ctx.fillStyle = ACCENT;
  ctx.fillRect(legendSquareX, legendSquareY, 8, 8);
  ctx.textAlign = "left";

  const chartTop = headerBaseline + 16;
  const chartBottom = tileY + tileH - ACTIVITY_PAD_Y - ACTIVITY_AXIS_RESERVE;
  const chartLeft = tileX + ACTIVITY_PAD_X;
  const chartRight = tileX + tileW - ACTIVITY_PAD_X;

  drawActivityChart(ctx, dailyCounts, peakMs, peakCount, {
    chartLeft, chartRight, chartTop, chartBottom,
    tickFontSize: 11, lineWidth: 2, peakDotR: 3.5, peakDotStrokeWidth: 1.5, peakDashWidth: 1,
    bucketCount: 180, smoothingWindow: 18
  });
}

interface ActivityChartRect {
  chartLeft: number;
  chartRight: number;
  chartTop: number;
  chartBottom: number;
  tickFontSize: number;
  lineWidth: number;
  peakDotR: number;
  peakDotStrokeWidth: number;
  peakDashWidth: number;
  bucketCount?: number;
  smoothingWindow?: number;
}

function drawActivityChart(
  ctx: CanvasRenderingContext2D,
  dailyCounts: Map<string, number>,
  peakMs: number,
  peakCount: number,
  r: ActivityChartRect
) {
  const { chartLeft, chartRight, chartTop, chartBottom } = r;
  const chartW = chartRight - chartLeft;
  const chartH = chartBottom - chartTop;

  if (dailyCounts.size === 0) {
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = `500 ${Math.max(13, r.tickFontSize)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("No activity in this export", chartLeft + chartW / 2, chartTop + chartH / 2 + 4);
    ctx.textAlign = "left";
    return;
  }

  let minMs = Infinity;
  let maxMs = -Infinity;
  for (const k of dailyCounts.keys()) {
    const [y, m, d] = k.split("-").map(Number);
    const ms = Date.UTC(y, m - 1, d);
    if (ms < minMs) minMs = ms;
    if (ms > maxMs) maxMs = ms;
  }
  if (!Number.isFinite(minMs)) return;
  const span = Math.max(1, maxMs - minMs);
  const totalDays = Math.max(1, Math.round(span / DAY_MS) + 1);
  const dayValues = new Float64Array(totalDays);
  for (const [k, v] of dailyCounts) {
    const [y, m, d] = k.split("-").map(Number);
    const idx = Math.round((Date.UTC(y, m - 1, d) - minMs) / DAY_MS);
    if (idx >= 0 && idx < totalDays) dayValues[idx] = v;
  }

  const smoothingWindow = r.smoothingWindow ?? 1;
  const half = Math.floor(smoothingWindow / 2);
  const sourceValueAt = (i: number): number => {
    if (smoothingWindow <= 1) return dayValues[i] ?? 0;
    let sum = 0;
    let count = 0;
    for (let j = -half; j <= half; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < totalDays) {
        sum += dayValues[idx];
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  };

  const N = Math.min(totalDays, r.bucketCount ?? 360);
  const buckets = new Float64Array(N);
  let bucketMax = 0;
  for (let b = 0; b < N; b++) {
    const startDay = Math.floor(b * totalDays / N);
    const endDay = Math.floor((b + 1) * totalDays / N);
    const bSpan = Math.max(1, endDay - startDay);
    let sum = 0;
    for (let i = startDay; i < endDay; i++) sum += sourceValueAt(i);
    const v = sum / bSpan;
    buckets[b] = v;
    if (v > bucketMax) bucketMax = v;
  }
  if (bucketMax === 0) bucketMax = 1;

  const points: Array<[number, number]> = new Array(N);
  for (let i = 0; i < N; i++) {
    const x = chartLeft + (i / (N - 1)) * chartW;
    const v = buckets[i] / bucketMax;
    const y = chartTop + (1 - v) * (chartH - 4) + 2;
    points[i] = [x, y];
  }

  const startYear = new Date(minMs).getUTCFullYear();
  const endYear = new Date(maxMs).getUTCFullYear();
  const yearTicks: Array<{ x: number; label: string }> = [];
  const MIN_TICK_GAP_PX = 8;
  const prevFont = ctx.font;
  ctx.font = `500 ${r.tickFontSize}px ${FONT}`;
  const labelW = ctx.measureText("0000").width;
  ctx.font = prevFont;
  for (let y = startYear; y <= endYear; y++) {
    const yMs = Date.UTC(y, 0, 1);
    const beforeRange = yMs < minMs || yMs > maxMs;
    if (beforeRange && y !== startYear) continue;
    const isFirstCandidate = yearTicks.length === 0;
    const tx = beforeRange ? chartLeft : chartLeft + ((yMs - minMs) / span) * chartW;
    const candidateLeft = isFirstCandidate ? tx : tx - labelW / 2;
    if (!isFirstCandidate) {
      const prev = yearTicks[yearTicks.length - 1];
      const prevIsFirst = yearTicks.length === 1;
      const prevRight = prevIsFirst ? prev.x + labelW : prev.x + labelW / 2;
      if (candidateLeft - prevRight < MIN_TICK_GAP_PX) continue;
    }
    yearTicks.push({ x: tx, label: String(y) });
  }
  if (yearTicks.length === 0) yearTicks.push({ x: chartLeft, label: String(startYear) });

  ctx.save();
  ctx.strokeStyle = HAIRLINE_SOFT;
  ctx.lineWidth = 1;
  for (let i = 1; i < yearTicks.length; i++) {
    const gx = Math.round(yearTicks[i].x) + 0.5;
    ctx.beginPath();
    ctx.moveTo(gx, chartTop);
    ctx.lineTo(gx, chartBottom);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  buildSmoothPath(ctx, points);
  ctx.lineTo(points[points.length - 1][0], chartBottom);
  ctx.lineTo(points[0][0], chartBottom);
  ctx.closePath();
  ctx.fillStyle = ACCENT_FILL;
  ctx.fill();
  ctx.restore();

  ctx.save();
  buildSmoothPath(ctx, points);
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = r.lineWidth;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();

  if (peakCount > 0 && peakMs >= minMs && peakMs <= maxMs) {
    const px = chartLeft + ((peakMs - minMs) / span) * chartW;
    const peakDayIdx = Math.round((peakMs - minMs) / DAY_MS);
    const peakBucketIdx = Math.max(0, Math.min(N - 1, Math.floor(peakDayIdx * N / totalDays)));
    const py = points[peakBucketIdx][1];
    ctx.save();
    ctx.strokeStyle = "rgba(88, 101, 242, 0.5)";
    ctx.lineWidth = r.peakDashWidth;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, chartBottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(px, py, r.peakDotR, 0, Math.PI * 2);
    ctx.fillStyle = BG_BOTTOM;
    ctx.fill();
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = r.peakDotStrokeWidth;
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = TEXT_MUTED;
  ctx.font = `500 ${r.tickFontSize}px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  for (let i = 0; i < yearTicks.length; i++) {
    ctx.textAlign = i === 0 ? "left" : "center";
    ctx.fillText(yearTicks[i].label, yearTicks[i].x, chartBottom + 14);
  }
  ctx.textAlign = "left";
}

function buildSmoothPath(ctx: CanvasRenderingContext2D, points: Array<[number, number]>) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
  }
}

function drawUppercaseLabel(ctx: CanvasRenderingContext2D, x: number, baseline: number, text: string) {
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = `500 12px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  setLetterSpacing(ctx, "1.4px");
  ctx.fillText(text.toUpperCase(), x, baseline);
  setLetterSpacing(ctx, "0px");
}

function drawGlassTile(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, radius: number
) {
  ctx.fillStyle = TILE_FILL;
  roundedRectPath(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.strokeStyle = TILE_BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();
  drawTopHighlight(ctx, x, y, w, radius, 1);
}

function drawTopHighlight(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, radius: number, inset: number
) {
  ctx.save();
  ctx.strokeStyle = GLASS_HIGHLIGHT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const r = Math.max(0, radius - inset);
  ctx.moveTo(x + inset + r, y + inset);
  ctx.lineTo(x + w - inset - r, y + inset);
  ctx.quadraticCurveTo(x + w - inset, y + inset, x + w - inset, y + inset + r);
  ctx.moveTo(x + inset, y + inset + r);
  ctx.quadraticCurveTo(x + inset, y + inset, x + inset + r, y + inset);
  ctx.stroke();
  ctx.restore();
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number, y: number, size: number, name: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (img) {
    ctx.drawImage(img, x, y, size, size);
  } else {
    ctx.fillStyle = ACCENT_FALLBACK_SOFT;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = ACCENT;
    ctx.font = `600 ${Math.round(size * 0.45)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
    ctx.fillText(initial, x + size / 2, y + size / 2 + 1);
    ctx.textAlign = "left";
  }
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 - 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = HAIRLINE;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function loadAvatar(url: string | null): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    if (!url.startsWith("blob:") && !url.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ctx.measureText(text.slice(0, mid) + "…").width <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return text.slice(0, lo) + "…";
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ("letterSpacing" in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = value;
  }
}

function drawVignetteBackgroundPortrait(ctx: CanvasRenderingContext2D) {
  const W = SHARE_CARD_PORTRAIT_W;
  const H = SHARE_CARD_PORTRAIT_H;

  ctx.fillStyle = BG_BOTTOM;
  ctx.fillRect(0, 0, W, H);

  const vert = ctx.createLinearGradient(0, 0, 0, H);
  vert.addColorStop(0, BG_TOP);
  vert.addColorStop(0.30, BG_BOTTOM);
  vert.addColorStop(1, BG_BOTTOM);
  ctx.fillStyle = vert;
  ctx.fillRect(0, 0, W, H);

  const top = ctx.createRadialGradient(
    W * 0.5, -H * 0.10, 0,
    W * 0.5, -H * 0.10, W * 0.55
  );
  top.addColorStop(0, "rgba(88, 101, 242, 0.22)");
  top.addColorStop(1, ACCENT_TRANSPARENT);
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H);

  const bot = ctx.createRadialGradient(
    W * 0.5, H * 1.10, 0,
    W * 0.5, H * 1.10, W * 0.55
  );
  bot.addColorStop(0, "rgba(88, 101, 242, 0.12)");
  bot.addColorStop(1, ACCENT_TRANSPARENT);
  ctx.fillStyle = bot;
  ctx.fillRect(0, 0, W, H);

  drawDotFieldBottomRight(ctx, W, H, 640, 640, 20, 1.2, 40, 40);

  ctx.strokeStyle = HAIRLINE_GLASS;
  ctx.lineWidth = 1;
  roundedRectPath(ctx, 0.5, 0.5, W - 1, H - 1, P_CARD_RADIUS - 0.5);
  ctx.stroke();

  drawTopHighlight(ctx, 0, 0, W, P_CARD_RADIUS, 1);
}

function drawPortraitWordmark(ctx: CanvasRenderingContext2D) {
  const W = SHARE_CARD_PORTRAIT_W;
  const fontSize = 22;
  const padL = 22;
  const padR = 26;
  const padY = 14;
  const dotR = 5;
  const gap = 16;
  const headText = "discord";
  const tailText = ".bairon.dev";

  ctx.save();
  ctx.font = `600 ${fontSize}px ${FONT}`;
  const headW = ctx.measureText(headText).width;
  ctx.font = `500 ${fontSize}px ${FONT}`;
  const tailW = ctx.measureText(tailText).width;
  ctx.restore();

  const textW = headW + tailW;
  const pillW = padL + dotR * 2 + gap + textW + padR;
  const pillH = fontSize + padY * 2;
  const pillX = (W - pillW) / 2;
  const pillY = P_PILL_TOP + (P_PILL_H - pillH) / 2;
  const centerY = pillY + pillH / 2;

  roundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = TILE_FILL;
  ctx.fill();
  ctx.strokeStyle = TILE_BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  const glow = ctx.createRadialGradient(pillX + padL + dotR, centerY, 0, pillX + padL + dotR, centerY, 14);
  glow.addColorStop(0, ACCENT_GLOW);
  glow.addColorStop(1, ACCENT_TRANSPARENT);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(pillX + padL + dotR, centerY, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(pillX + padL + dotR, centerY, dotR, 0, Math.PI * 2);
  ctx.fill();

  const textBaseline = centerY + 7;
  const textStartX = pillX + padL + dotR * 2 + gap;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `600 ${fontSize}px ${FONT}`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.fillText(headText, textStartX, textBaseline);
  ctx.font = `500 ${fontSize}px ${FONT}`;
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.fillText(tailText, textStartX + headW, textBaseline);
}

function drawPortraitIdentity(
  ctx: CanvasRenderingContext2D,
  d: ShareCardData,
  avatar: HTMLImageElement | null
) {
  const W = SHARE_CARD_PORTRAIT_W;
  const cx = W / 2;

  const avatarLeft = (W - P_AVATAR_SIZE) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, P_AVATAR_TOP + P_AVATAR_SIZE / 2, P_AVATAR_SIZE / 2 + 5, 0, Math.PI * 2);
  ctx.strokeStyle = HALO_RING;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();

  drawAvatar(ctx, avatar, avatarLeft, P_AVATAR_TOP, P_AVATAR_SIZE, d.ownerName);

  setLetterSpacing(ctx, "-1.5px");
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `700 64px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";
  ctx.fillText(d.ownerName || "You", cx, P_NAME_BASELINE);
  setLetterSpacing(ctx, "0px");

  const fontSize = 28;

  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";

  if (d.ownerCreatedAt) {
    ctx.font = `500 ${fontSize}px ${FONT}`;
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.fillText(`Joined ${JOIN_DATE_FMT.format(new Date(d.ownerCreatedAt))}`, cx, P_JOINED_BASELINE);
  }
  if (d.tagline) {
    ctx.font = `italic 400 ${fontSize}px ${FONT}`;
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.fillText(`"${d.tagline}"`, cx, P_TAGLINE_BASELINE);
  }
  ctx.textAlign = "left";
  ctx.restore();
}

function drawPortraitHero(ctx: CanvasRenderingContext2D, d: ShareCardData) {
  const W = SHARE_CARD_PORTRAIT_W;
  const tileX = P_PAD;
  const tileY = P_HERO_TOP;
  const tileW = W - P_PAD * 2;
  const tileH = P_HERO_H;

  drawGlassTile(ctx, tileX, tileY, tileW, tileH, P_TILE_RADIUS);

  const innerL = tileX + P_HERO_PAD_X;
  const innerR = tileX + tileW - P_HERO_PAD_X;

  drawUppercaseLabelSized(ctx, innerL, tileY + P_HERO_PAD_Y + 14, "Messages sent", 28, "3.8px");

  if (d.ownerCreatedAt) {
    const years = Math.max(1, Math.round((Date.now() - d.ownerCreatedAt) / YEAR_MS));
    drawTrendChipPortrait(ctx, innerR, tileY + P_HERO_PAD_Y - 4, `active ${years} yr${years === 1 ? "" : "s"}`);
  }

  const captionBaseline = tileY + tileH - P_HERO_PAD_Y - 4;
  const showCaption = !!d.ownerCreatedAt && d.totalMessages > 0;
  if (showCaption) {
    const days = Math.max(1, Math.floor((Date.now() - d.ownerCreatedAt!) / DAY_MS));
    const avgPerDay = Math.max(1, Math.round(d.totalMessages / days));
    drawCaptionWithBold(
      ctx,
      innerL,
      captionBaseline,
      `That's roughly `,
      avgPerDay.toLocaleString(),
      ` a day, every day, since you joined.`,
      26,
      innerR - innerL - 100
    );
  }

  const sparkBarW = 7;
  const sparkGap = 5;
  const sparkH = 52;
  const sparkW = 7 * sparkBarW + 6 * sparkGap;
  drawSparklineSized(ctx, innerR - sparkW, captionBaseline - sparkH, sparkH, sparkBarW, sparkGap, computeSparklinePoints(d.dailyCounts));

  const valueFontSize = 124;
  const valueBaseline = tileY + tileH - P_HERO_PAD_Y - 60 - 12;
  setLetterSpacing(ctx, "-6px");
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `700 ${valueFontSize}px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(d.totalMessages.toLocaleString(), innerL, valueBaseline);
  setLetterSpacing(ctx, "0px");
}

function drawTrendChipPortrait(ctx: CanvasRenderingContext2D, rightX: number, topY: number, text: string) {
  const fontSize = 22;
  const padX = 18;
  const padY = 9;
  const iconW = 16;
  const iconGap = 10;

  ctx.save();
  ctx.font = `600 ${fontSize}px ${FONT}`;
  const textW = ctx.measureText(text).width;
  ctx.restore();

  const w = padX + iconW + iconGap + textW + padX;
  const h = fontSize + padY * 2 + 4;
  const x = rightX - w;
  const y = topY;

  roundedRectPath(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = ACCENT_FILL;
  ctx.fill();
  ctx.strokeStyle = ACCENT_BORDER;
  ctx.lineWidth = 1;
  roundedRectPath(ctx, x + 0.5, y + 0.5, w - 1, h - 1, (h - 1) / 2);
  ctx.stroke();

  const iconX = x + padX;
  const iconCy = y + h / 2;
  ctx.save();
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(iconX,         iconCy + 4);
  ctx.lineTo(iconX + 4.5,   iconCy);
  ctx.lineTo(iconX + 8,     iconCy + 2.5);
  ctx.lineTo(iconX + 13,    iconCy - 5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(iconX + 13, iconCy - 5);
  ctx.lineTo(iconX + 9,  iconCy - 5);
  ctx.moveTo(iconX + 13, iconCy - 5);
  ctx.lineTo(iconX + 13, iconCy - 1);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = ACCENT;
  ctx.font = `600 ${fontSize}px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(text, iconX + iconW + iconGap, iconCy + 6);
}

function drawPortraitSupport(ctx: CanvasRenderingContext2D, d: ShareCardData) {
  const W = SHARE_CARD_PORTRAIT_W;
  const fullW = W - P_PAD * 2;
  const tileW = Math.floor((fullW - P_SUPPORT_GAP * 2) / 3);

  const novels = d.totalCharacters >= 800_000 ? Math.round(d.totalCharacters / 800_000) : 0;
  const tiles: Array<{ label: string; value: string; unit: string; glow?: boolean }> = [
    {
      label: "Characters",
      value: COMPACT_FMT.format(d.totalCharacters),
      unit: novels >= 1 ? `≈ ${novels} novel${novels === 1 ? "" : "s"}` : "lifetime"
    },
    {
      label: "People",
      value: d.peopleTalkedTo.toLocaleString(),
      unit: "DMs & groups"
    },
    {
      label: "Best streak",
      value: d.longestStreak.toLocaleString(),
      unit: "unbroken",
      glow: true
    }
  ];

  for (let i = 0; i < tiles.length; i++) {
    const x = P_PAD + i * (tileW + P_SUPPORT_GAP);
    drawPortraitSupportTile(ctx, x, P_SUPPORT_TOP, tileW, P_SUPPORT_H, tiles[i]);
  }
}

function drawPortraitSupportTile(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  t: { label: string; value: string; unit: string; glow?: boolean }
) {
  drawGlassTile(ctx, x, y, w, h, P_TILE_RADIUS);

  drawUppercaseLabelSized(ctx, x + P_SUPPORT_PAD, y + P_SUPPORT_PAD + 14, t.label, 20, "2.8px");

  const valueBaseline = y + h - P_SUPPORT_PAD - 28;
  setLetterSpacing(ctx, "-3px");
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `700 72px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(t.value, x + P_SUPPORT_PAD, valueBaseline);
  const valueW = ctx.measureText(t.value).width;
  setLetterSpacing(ctx, "0px");

  if (t.glow) {
    const cx = x + P_SUPPORT_PAD + valueW + 18;
    const cy = valueBaseline - 18;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
    grad.addColorStop(0, ACCENT_GLOW);
    grad.addColorStop(1, ACCENT_TRANSPARENT);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  if (t.unit) {
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = `500 26px ${FONT}`;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(t.unit, x + P_SUPPORT_PAD, y + h - P_SUPPORT_PAD);
  }
}

function drawPortraitActivity(ctx: CanvasRenderingContext2D, dailyCounts: Map<string, number>) {
  const W = SHARE_CARD_PORTRAIT_W;
  const tileX = P_PAD;
  const tileY = P_ACTIVITY_TOP;
  const tileW = W - P_PAD * 2;
  const tileH = P_ACTIVITY_H;

  drawGlassTile(ctx, tileX, tileY, tileW, tileH, P_TILE_RADIUS);

  const headerBaseline = tileY + P_ACTIVITY_PAD_Y + 14;
  drawUppercaseLabelSized(ctx, tileX + P_ACTIVITY_PAD_X, headerBaseline, "Activity over time", 22, "3px");

  let peakMs = 0;
  let peakCount = 0;
  for (const [k, v] of dailyCounts) {
    if (v > peakCount) {
      peakCount = v;
      const [y, m, d] = k.split("-").map(Number);
      peakMs = Date.UTC(y, m - 1, d);
    }
  }

  ctx.save();
  ctx.font = `500 18px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "right";
  setLetterSpacing(ctx, "0.8px");
  ctx.fillStyle = TEXT_MUTED;
  let rightX = tileX + tileW - P_ACTIVITY_PAD_X;
  if (peakCount > 0) {
    const peakDate = JOIN_DATE_FMT.format(new Date(peakMs));
    const peakLabel = `PEAK · ${peakCount.toLocaleString()} ON ${peakDate.toUpperCase()}`;
    ctx.fillText(peakLabel, rightX, headerBaseline);
    rightX -= ctx.measureText(peakLabel).width + 22;
  }
  const legendText = "MESSAGES / DAY";
  const legendTextW = ctx.measureText(legendText).width;
  ctx.fillText(legendText, rightX, headerBaseline);
  setLetterSpacing(ctx, "0px");
  const swatchX = rightX - legendTextW - 8 - 12;
  ctx.fillStyle = ACCENT;
  ctx.fillRect(swatchX, headerBaseline - 14, 12, 12);
  ctx.restore();

  const chartTop = headerBaseline + 32;
  const chartBottom = tileY + tileH - P_ACTIVITY_PAD_Y - P_ACTIVITY_AXIS_RESERVE;
  const chartLeft = tileX + P_ACTIVITY_PAD_X;
  const chartRight = tileX + tileW - P_ACTIVITY_PAD_X;

  drawActivityChart(ctx, dailyCounts, peakMs, peakCount, {
    chartLeft, chartRight, chartTop, chartBottom,
    tickFontSize: 28, lineWidth: 4, peakDotR: 9, peakDotStrokeWidth: 3, peakDashWidth: 1.8,
    bucketCount: 80, smoothingWindow: 21
  });
}

function drawUppercaseLabelSized(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseline: number,
  text: string,
  fontSize: number,
  tracking: string
) {
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = `500 ${fontSize}px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  setLetterSpacing(ctx, tracking);
  ctx.fillText(text.toUpperCase(), x, baseline);
  setLetterSpacing(ctx, "0px");
}

function drawSparklineSized(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, h: number,
  barW: number, gap: number,
  points: number[]
) {
  ctx.save();
  ctx.fillStyle = ACCENT;
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < points.length; i++) {
    const bh = Math.max(3, points[i] * h);
    const bx = x + i * (barW + gap);
    const by = y + (h - bh);
    roundedRectPath(ctx, bx, by, barW, bh, 2);
    ctx.fill();
  }
  ctx.restore();
}
