function escapeHTML(s: string): string {
  return s.replace(/[&<>"]/g, c => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
export function highlightHTML(text: string, query: string): string {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return escapeHTML(text);
  const lower = text.toLowerCase();
  let out = "";
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(q, i);
    if (idx < 0) {
      out += escapeHTML(text.slice(i));
      break;
    }
    if (idx > i) out += escapeHTML(text.slice(i, idx));
    out += `<mark>${escapeHTML(text.slice(idx, idx + q.length))}</mark>`;
    i = idx + q.length;
  }
  return out;
}
