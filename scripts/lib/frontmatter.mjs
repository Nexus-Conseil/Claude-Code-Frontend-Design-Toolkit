// Minimal YAML front-matter reader. Handles what this plugin's skills and
// agents use: scalar `key: value` lines, block lists (`- item`), flow lists
// (`[a, b]`) and quoted strings. Anything fancier is an authoring error here.

export function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { data: null, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { data: null, body: text };
  const raw = text.slice(3, end).replace(/^\r?\n/, '');
  const body = text.slice(end + 4).replace(/^\r?\n/, '');
  return { data: parseBlock(raw), body };
}

function unquote(value) {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function parseScalar(value) {
  const v = value.trim();
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    return inner ? inner.split(',').map(unquote) : [];
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  return unquote(v);
}

function parseBlock(raw) {
  const data = {};
  let currentKey = null;
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const listMatch = line.match(/^\s+-\s+(.*)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey] = [...data[currentKey], unquote(listMatch[1])];
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      const [, key, value] = kv;
      currentKey = key;
      data[key] = value.trim() === '' ? '' : parseScalar(value);
      continue;
    }
    // Continuation line of a folded scalar (indented text under a key).
    if (currentKey && /^\s+\S/.test(line) && typeof data[currentKey] === 'string') {
      data[currentKey] = `${data[currentKey]} ${line.trim()}`.trim();
    }
  }
  return data;
}
