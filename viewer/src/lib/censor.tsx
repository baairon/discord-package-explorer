import { Fragment, type ReactNode } from "react";

const RUN_RX = /█+/g;

export function renderCensored(text: string | null | undefined): ReactNode {
  if (!text) return text ?? "";
  if (!text.includes("█")) return text;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(RUN_RX)) {
    const idx = match.index ?? 0;
    if (idx > last) {
      out.push(<Fragment key={key++}>{text.slice(last, idx)}</Fragment>);
    }
    const runLen = match[0].length;
    out.push(
      <span
        key={key++}
        className="skel"
        style={{ width: `${Math.min(runLen, 40) * 0.55}em` }}
        aria-hidden="true"
      />
    );
    last = idx + runLen;
  }
  if (last < text.length) {
    out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  }
  return out;
}
