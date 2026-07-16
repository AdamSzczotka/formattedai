import { tokenize } from './sentence-splitter.js';

function lcsLengths(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

function backtrack(dp, a, b) {
  const ops = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.push({ type: 'same', text: a[i - 1] });
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: 'del', text: a[i - 1] });
      i--;
    } else {
      ops.push({ type: 'add', text: b[j - 1] });
      j--;
    }
  }
  while (i > 0) { ops.push({ type: 'del', text: a[--i + 1] - 1 < 0 ? a[0] : a[i] }); }
  while (j > 0) { ops.push({ type: 'add', text: b[--j + 1] - 1 < 0 ? b[0] : b[j] }); }
  return ops.reverse();
}

function backtrackClean(dp, a, b) {
  const ops = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: 'same', text: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: 'add', text: b[j - 1] });
      j--;
    } else if (i > 0) {
      ops.push({ type: 'del', text: a[i - 1] });
      i--;
    }
  }
  return ops.reverse();
}

function mergeAdjacent(ops) {
  const merged = [];
  for (const op of ops) {
    const last = merged[merged.length - 1];
    if (last && last.type === op.type) {
      last.text += op.text;
    } else {
      merged.push({ ...op });
    }
  }
  return merged;
}

export function wordDiff(oldText, newText) {
  const a = tokenize(oldText);
  const b = tokenize(newText);
  if (!a.length && !b.length) return [];
  const dp = lcsLengths(a, b);
  const ops = backtrackClean(dp, a, b);
  return mergeAdjacent(ops);
}

export function diffStats(ops) {
  let added = 0, removed = 0, kept = 0;
  for (const op of ops) {
    const len = op.text.length;
    if (op.type === 'add') added += len;
    else if (op.type === 'del') removed += len;
    else kept += len;
  }
  return { added, removed, kept };
}

export function renderDiffInto(container, ops) {
  if (!container) return;
  const frag = document.createDocumentFragment();
  for (const op of ops) {
    if (op.type === 'same') {
      frag.appendChild(document.createTextNode(op.text));
    } else {
      const span = document.createElement('span');
      span.className = op.type === 'add' ? 'diff-add' : 'diff-del';
      span.textContent = op.text;
      frag.appendChild(span);
    }
  }
  container.replaceChildren(frag);
}
