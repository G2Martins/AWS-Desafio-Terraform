// Post-build smoke check (npm run check, also part of build:pages). Exits 1 on any failure.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { lexFile } from './code.ts';

const SITE = 'https://g2martins.github.io/AWS-Desafio-Terraform/';
const PROJECT = 'https://g2portfolio.grovicdata.com/projetos/aws-terraform/';
const root = new URL('../dist/site/browser/', import.meta.url);
const repo = new URL('../../', import.meta.url);
const fails: string[] = [];
const must = (ok: unknown, msg: string) => ok || fails.push(msg);
const h = readFileSync(new URL('index.html', root), 'utf8');

// SEO essentials
must((h.match(/<h1[\s>]/g) ?? []).length === 1, 'expected exactly one <h1>');
must(h.includes(`<link rel="canonical" href="${SITE}">`), 'canonical missing');
const desc = h.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
must(desc.length >= 70 && desc.length <= 160, `description length ${desc.length} (want 70-160)`);
must(h.includes(`<meta property="og:image" content="${SITE}og/aws-terraform.png">`), 'og:image missing');
try {
  const ld = JSON.parse(h.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? '');
  must(ld.creator?.['@id'] === 'https://g2portfolio.grovicdata.com/#person', 'JSON-LD creator @id wrong');
} catch { fails.push('invalid JSON-LD'); }

// Credit bar + footer
must(h.includes(`<a href="${PROJECT}">Projeto de portfólio de Gustavo Martins Gripaldi.</a>`), 'credit link missing');
must(h.includes('href="https://g2portfolio.grovicdata.com/"'), 'portfolio footer link missing');
must(h.includes('href="https://github.com/G2Martins/AWS-Desafio-Terraform"'), 'repo link missing');

// Code: every line of every .tf/.sh is rendered, the lexer round-trips, every #anchor resolves.
for (const name of readdirSync(repo).filter((f) => /\.(tf|sh)$/.test(f))) {
  const src = readFileSync(new URL(name, repo), 'utf8');
  const lines = src.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
  const toks = lexFile(src);
  must(toks.length === lines.length && toks.every((t, i) => t.map((x) => x[1]).join('') === lines[i]), `${name}: lexer does not round-trip`);
  const pre = name === 'main.tf' ? 'L' : `${name}-L`;
  must(h.includes(`id="${pre}${lines.length}"`) && !h.includes(`id="${pre}${lines.length + 1}"`), `${name}: not every line rendered`);
}
const ids = new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const [, id] of h.matchAll(/href="#([^"]+)"/g)) must(ids.has(id), `broken anchor #${id}`);

// Internal links end in "/" (GitHub Pages answers /path with a 301); same for portfolio links.
for (const [, href] of h.matchAll(/<a [^>]*href="([^"#]+)"/g)) {
  const internal = !/^[a-z]+:/.test(href);
  if (internal || href.includes('g2portfolio.grovicdata.com')) must(/\/$|\.[a-z0-9]+$/i.test(href.split('?')[0]), `link without trailing slash: ${href}`);
}

// No em dash and no AWS access key id anywhere in the output (or in the repo's Terraform/docs).
const walk = (dir: URL): URL[] => readdirSync(dir).flatMap((n) => {
  const p = new URL(n, dir);
  return statSync(p).isDirectory() ? walk(new URL(`${n}/`, dir)) : [p];
});
const texts = walk(root).filter((f) => /\.(html|js|css|json|txt|xml|svg)$/.test(f.pathname) && !f.pathname.endsWith('3rdpartylicenses.txt'));
for (const f of [...texts, ...readdirSync(repo).filter((n) => /\.(tf|sh|md)$/.test(n)).map((n) => new URL(n, repo))]) {
  const t = readFileSync(f, 'utf8');
  if (texts.includes(f)) must(!t.includes(String.fromCharCode(0x2014)), `em dash in ${decodeURIComponent(f.pathname).split('/').pop()}`);
  must(!/AKIA[0-9A-Z]{16}/.test(t), `AWS access key id pattern in ${decodeURIComponent(f.pathname).split('/').pop()}`);
}
for (const f of ['robots.txt', 'sitemap.xml', 'favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'og/aws-terraform.png'])
  must(existsSync(new URL(f, root)), `missing /${f}`);

if (fails.length) { console.error(`check: ${fails.length} problem(s)\n- ` + [...new Set(fails)].join('\n- ')); process.exit(1); }
console.log(`check: SEO, credit, ${ids.size} ids / anchors, trailing slashes, no em dash, no AWS keys: OK`);
