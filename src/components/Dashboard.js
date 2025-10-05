import React, { useEffect, useState } from 'react';

// Minimal, safe-ish markdown-to-React renderer supporting headings (###), bold **text**, lists (-), and paragraphs.
const renderMarkdown = (md) => {
  if (!md) return null;

  // Decode HTML entities first so &amp; and &#039; become real characters, then escape to prevent raw HTML
  const decodeEntities = (str) => {
    if (!str) return str;
    if (typeof document !== 'undefined') {
      const txt = document.createElement('textarea');
      txt.innerHTML = str;
      return txt.value;
    }
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#039;/g, "'");
  };

  const cleanMd = decodeEntities(md);

  // Escape HTML to avoid raw HTML injection (only escape < and >)
  const escapeHtml = (unsafe) => unsafe
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const lines = cleanMd.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    let line = lines[i].trimEnd();
    if (line === '') {
      i++;
      continue;
    }

    // Heading (###)
    if (/^#{1,6}\s+/.test(line)) {
      const level = line.match(/^#{1,6}/)[0].length;
      const content = line.replace(/^#{1,6}\s+/, '');
      blocks.push({ type: 'heading', level, content });
      i++;
      continue;
    }

    // List (consecutive lines starting with - )
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^[-*]\s+/, '');
        items.push(item);
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    // Paragraph (collect until empty line)
    let para = line;
    i++;
    while (i < lines.length && lines[i].trim() !== '') {
      para += '\n' + lines[i];
      i++;
    }
    blocks.push({ type: 'paragraph', content: para });
  }

  // Convert inline markdown (bold **text**) and simple inline code `code`
  const renderInline = (text) => {
    const escaped = escapeHtml(text);

    // Replace bold **text**
    const parts = [];
    let rest = escaped;
    const boldRegex = /\*\*(.+?)\*\*/;
    while (rest.length) {
      const m = rest.match(boldRegex);
      if (!m) { parts.push(rest); break; }
      const idx = m.index;
      if (idx > 0) parts.push(rest.slice(0, idx));
      parts.push(React.createElement('strong', { key: Math.random() }, m[1]));
      rest = rest.slice(idx + m[0].length);
    }

    // If no strong parts were found, return escaped string (but preserve simple `code` segments)
    if (parts.length === 1 && typeof parts[0] === 'string') {
      // handle inline code
      const codeParts = [];
      let r = parts[0];
      const codeRegex = /`([^`]+?)`/;
      while (r.length) {
        const mc = r.match(codeRegex);
        if (!mc) { codeParts.push(r); break; }
        const ix = mc.index;
        if (ix > 0) codeParts.push(r.slice(0, ix));
        codeParts.push(React.createElement('code', { key: Math.random() }, mc[1]));
        r = r.slice(ix + mc[0].length);
      }
      return codeParts.map((p, idx) => (typeof p === 'string' ? p : React.cloneElement(p, { key: idx })));
    }

    // If mixed parts exist (strings and React nodes), ensure keys and process code inside strings
    return parts.map((part, idx) => {
      if (typeof part === 'string') {
        // process inline code in this string
        const fragments = [];
        let r = part;
        const codeRegex = /`([^`]+?)`/;
        while (r.length) {
          const mc = r.match(codeRegex);
          if (!mc) { fragments.push(r); break; }
          const ix = mc.index;
          if (ix > 0) fragments.push(r.slice(0, ix));
          fragments.push(React.createElement('code', { key: Math.random() }, mc[1]));
          r = r.slice(ix + mc[0].length);
        }
        return fragments.map((f, j) => (typeof f === 'string' ? f : React.cloneElement(f, { key: `${idx}-${j}` })));
      }
      return React.cloneElement(part, { key: idx });
    }).flat();
  };

  // Build React nodes
  const nodes = blocks.map((blk, idx) => {
    if (blk.type === 'heading') {
      const Tag = 'h' + Math.min(6, blk.level + 1); // shift level for style
      return React.createElement(Tag, { key: idx }, renderInline(blk.content));
    }
    if (blk.type === 'list') {
      return React.createElement('ul', { key: idx }, blk.items.map((it, j) => React.createElement('li', { key: j }, renderInline(it))));
    }
    if (blk.type === 'paragraph') {
      return React.createElement('p', { key: idx }, renderInline(blk.content));
    }
    return null;
  });

  return React.createElement(React.Fragment, null, nodes);
};

const Dashboard = ({ analysis, onBack }) => {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    // trigger animate-in after mount
    const t = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`panel-card panel-min-300 ${entered ? 'animate-in' : ''}`}>
      <div className="section-heading analysis-header" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div className="empty-emoji" aria-hidden>🤖</div>
          <h2 className="analysis-title">AI Climate Analysis</h2>
        </div>
        {onBack ? (
          <button type="button" className="button-secondary" onClick={onBack} aria-label="Back to input">
            ← Back
          </button>
        ) : null}
      </div>

      {analysis ? (
        <div className="analysis-copy">
          {renderMarkdown(analysis)}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-emoji">🌤️</div>
          <p className="empty-text">
            Your personalized weather analysis, precautions, and packing list will appear here once you submit a query.
          </p>
        </div>
      )}
      <DataSources />
    </div>
  );
};

export default Dashboard;