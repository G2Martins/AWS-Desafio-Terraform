// Publishes the static build to the repo-root docs/ (GitHub Pages: main branch, /docs, base /AWS-Desafio-Terraform/).
import { cp, rm, writeFile } from 'node:fs/promises';

const dist = new URL('../dist/site/browser/', import.meta.url);
const docs = new URL('../../docs/', import.meta.url);
// ponytail: async cp on purpose: Node 22's cpSync exits 127 silently on the non-ASCII path ("Programação").
await rm(docs, { recursive: true, force: true });
await cp(dist, docs, { recursive: true });
await rm(new URL('index.csr.html', docs), { force: true }); // single prerendered page, no client shell needed
await writeFile(new URL('.nojekyll', docs), '');
console.log('pages: site/dist/site/browser -> docs/ (+ .nojekyll)');
