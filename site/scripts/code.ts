// Build-time syntax highlighting (npm run code, part of build): reads every .tf/.sh at the repo root and writes
// src/app/data/code.json with pre-tokenized lines plus a line index per Terraform address, so the page ships
// plain <span class="t-*"> markup and no runtime highlighter. ponytail: regex lexer, good for HCL as written
// here (no nested heredocs or /* */ blocks); swap for a real grammar if the .tf files grow past that.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

export type Tok = [cls: string, text: string];
const KW = new Set(['resource', 'data', 'variable', 'output', 'provider', 'terraform', 'locals', 'module']);
const LEX = /(#.*|\/\/.*)|("(?:[^"\\]|\\.)*")|(<<-?\w+)|\b(\d+(?:\.\d+)?)\b|\b(true|false|null)\b|([A-Za-z_][\w-]*(?:\.[A-Za-z_*][\w-]*)*)|(\s+)|(.)/gy;

/** Splits a string literal so `${...}` interpolations get their own class. */
const str = (s: string, cls: string): Tok[] =>
  s.split(/(\$\{[^}]*\})/).filter(Boolean).map((p) => [p.startsWith('${') ? 't-ref' : cls, p]);

export function lexLine(line: string): Tok[] {
  const out: Tok[] = [];
  let prev = ''; // class of the previous non-space token
  LEX.lastIndex = 0;
  for (let m; LEX.lastIndex < line.length && (m = LEX.exec(line)); ) {
    const [t, com, s, here, num, bool, id] = m;
    const rest = line.slice(LEX.lastIndex);
    let cls = ''; // punctuation and whitespace stay plain text
    if (com) cls = 't-com';
    else if (s) { prev = prev === 't-kw' || prev === 't-lbl' ? 't-lbl' : 't-str'; out.push(...str(s, prev)); continue; }
    else if (here) cls = 't-str';
    else if (num) cls = 't-num';
    else if (bool) cls = 't-bool';
    else if (id) {
      if (!line.slice(0, m.index).trim() && KW.has(id)) cls = 't-kw';
      else if (/^\s*=(?!=)/.test(rest)) cls = 't-attr';
      else if (/^\s*\{/.test(rest)) cls = 't-blk';
      else if (/^\(/.test(rest)) cls = 't-fn';
      else if (id.includes('.')) cls = 't-ref';
      else cls = 't-id';
    }
    out.push([cls, t]);
    if (t.trim()) prev = cls;
  }
  // Merge neighbours of the same class: fewer spans in the prerendered HTML.
  return out.reduce<Tok[]>((acc, tok) => {
    const last = acc.at(-1);
    if (last && last[0] === tok[0]) last[1] += tok[1];
    else acc.push([tok[0], tok[1]]);
    return acc;
  }, []);
}

/** Heredoc bodies (user_data) are one string token per line; everything else goes through the lexer. */
export function lexFile(src: string): Tok[][] {
  let heredoc = '';
  return src.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n').map((line) => {
    if (heredoc) {
      if (line.trim() === heredoc) { heredoc = ''; return [['t-str', line]]; }
      return [['t-sh', line]];
    }
    heredoc = line.match(/<<-?(\w+)\s*$/)?.[1] ?? '';
    return lexLine(line);
  });
}

/** Line (1-based) of every top-level block and of the first nested attribute/block inside it. */
export function index(src: string): Record<string, number> {
  const idx: Record<string, number> = {};
  let addr = '';
  src.replace(/\r\n/g, '\n').split('\n').forEach((line, i) => {
    const top = line.match(/^(resource|data|variable|output|provider)\s+"([^"]+)"(?:\s+"([^"]+)")?/);
    if (top) {
      const [, kw, a, b] = top;
      addr = kw === 'resource' ? `${a}.${b}` : kw === 'data' ? `data.${a}.${b}` : kw === 'variable' ? `var.${a}` : `${kw}.${a}`;
      idx[addr] ??= i + 1;
      return;
    }
    const inner = addr && line.match(/^\s+([a-z_]+)\s*[={]/);
    if (inner) idx[`${addr}:${inner[1]}`] ??= i + 1;
  });
  return idx;
}

if (import.meta.main) {
  const root = new URL('../../', import.meta.url);
  const files = readdirSync(root).filter((f) => /\.(tf|sh)$/.test(f)).sort();
  const data = files.map((name) => {
    const src = readFileSync(new URL(name, root), 'utf8');
    return { name, lines: lexFile(src), index: index(src) };
  });
  writeFileSync(new URL('../src/app/data/code.json', import.meta.url), JSON.stringify(data));
  console.log(`code: ${files.join(', ')} -> src/app/data/code.json`);
}
