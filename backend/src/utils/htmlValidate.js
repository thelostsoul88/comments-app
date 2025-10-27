const allowed = new Set(['a','code','i','strong']);

export function isValidXHTML(html) {
  const tagRegex = /<\/?([a-zA-Z]+)(\s+[^>]*)?>/g;
  const stack = [];
  let m;
  while ((m = tagRegex.exec(html)) !== null) {
    const raw = m[0];
    const tag = m[1].toLowerCase();
    const isClosing = raw.startsWith("</");
    const isSelfClosing = /\/>\s*$/.test(raw);
    if (!allowed.has(tag)) return false;
    if (isSelfClosing) continue;
    if (!isClosing) stack.push(tag);
    else {
      if (stack.length === 0) return false;
      const top = stack.pop();
      if (top !== tag) return false;
    }
  }
  return stack.length === 0;
}
