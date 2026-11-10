# CLAUDE.md, AWS-Desafio-Terraform

> **Spec viva.** Porta de entrada lida pelo agente em toda sessão. Não duplica o [README.md](README.md), **aponta** pra ele. Atualize quando uma regra, comando, módulo ou armadilha mudar.
>
> **Última revisão:** 2026-11-10
> **Detalhes do desafio, revisão, como rodar e custo:** [README.md](README.md)

---

## 1. O que é

Desafio técnico de Terraform na AWS (VExpenses, outubro de 2024): VPC, sub-rede pública, security group, EC2 Debian 12 com Nginx via `user_data`, S3 e IAM, tudo em [`main.tf`](main.tf). Peça de portfólio de **Gustavo Martins Gripaldi** ([g2portfolio.grovicdata.com/projetos/aws-terraform/](https://g2portfolio.grovicdata.com/projetos/aws-terraform/)). Página: <https://g2martins.github.io/AWS-Desafio-Terraform/>. O estado anterior à página está na tag `v1-original`.

## 2. Stack + Comandos

Terraform (providers `aws` e `tls`). Página em `site/`: Angular 21.2 standalone, SSG (`outputMode: "static"`), incremental hydration (corpo em `@defer (hydrate never)`), Tailwind v4, Geist/Geist Mono self-hosted em `site/public/fonts` com preload. Node 22.18+ (scripts `.ts` nativos). GitHub Pages em `main:/docs`, `baseHref` `/AWS-Desafio-Terraform/`.

```bash
cd site
npm start            # code + ng serve
npm run code         # tokeniza .tf/.sh da raiz -> src/app/data/code.json
npm run build        # code + ng build (prerender)
npm run check        # SEO, crédito, âncoras, barra final, round-trip do lexer, sem travessão, sem chave AWS
npm run build:pages  # build + check + copia para ../docs (+ .nojekyll)
npm run og           # python scripts/og.py: OG 1200x630 + favicon-32 + apple-touch-icon
```

## 3. Mapa de módulos

| Caminho | Responsabilidade |
|---|---|
| `main.tf` | Entrega original do desafio. Não editar: a página documenta os ajustes em vez de corrigir |
| `site/scripts/code.ts` | Lexer HCL por regex + índice `endereço -> linha` (`aws_vpc.main_vpc`, `aws_instance.debian_ec2:user_data`) |
| `site/src/app/code.ts` | Lê `code.json`; `at(addr)` dá a linha, `anchor()` o id (`L28`) |
| `site/src/app/doc.html` | Todo o texto da página (desafio, arquitetura, código, como rodar, segurança, custo) |
| `site/src/app/diagram.ts` | SVG da arquitetura, vertical (legível a 390px); cada caixa linka a linha do `main.tf` |
| `site/src/app/app.ts` | Barra de crédito + `@defer (hydrate never)` do corpo |
| `site/src/index.html` | Title, description, canonical, OG, JSON-LD `SoftwareSourceCode` (estático: página única) |
| `site/scripts/` | `check.ts`, `pages.ts`, `og.py` + `og.html` |
| `docs/` | Saída do build publicada. Nunca editar à mão |

## 4. Regras SEMPRE-ATIVAS

- **Nenhuma credencial** em `.tf`, README, página ou histórico. `npm run check` falha em qualquer `AKIA...`. `.gitignore` barra `.terraform/`, `*.tfstate*`, `*.tfplan`, `*.pem`, `.env*`.
- **Não inventar saída**: nada de output de `plan`/`apply` que não foi rodado; se aparecer, rotular "exemplo ilustrativo". Afirmação sobre erro vem da leitura do código e diz isso.
- **Linhas sempre do índice** (`at('...')`), nunca número de linha escrito à mão.
- **Design Valerium**: Geist + Geist Mono, eyebrow mono, card "well", ticks, dot grid, out-expo. Cores só pelos tokens de `:root` em `site/src/styles.css` (grafite + acento âmbar; tokens de código `--t-*`).
- **Animação só `transform`/`opacity`**, com `prefers-reduced-motion`. O reveal é CSS scroll-driven (`animation-timeline: view()`): conteúdo visível sem JS, e o hero (LCP) nunca anima.
- **Zero travessão longo (U+2014)** em texto visível; usar ":", ",", "." ou "·". O `check` varre o build.
- **Links internos terminam em `/`** (`TrailingSlashSerializer` registrado em `app.config.ts`); links para o portfólio também.
- **`npm run build:pages` verde** antes de publicar. `docs/` é build.

## 5. Segurança

- Página estática: sem formulário, sem token, sem chamada externa em runtime.
- Credenciais AWS só no ambiente de quem roda o Terraform (SSO/perfil ou OIDC no CI). A página explica o fluxo sem mostrar valor nenhum.
- O state local guarda a chave privada gerada por `tls_private_key` em texto puro: nunca versionar state nem `.pem`.

## 6. Common Hurdles

- **Angular remove nós de texto só com espaço** entre elementos (`</b> <span>` cola). Pôr o espaço dentro do texto (`<b>Título. </b><span>`).
- **Chaves `{ }` e `@` em template** quebram o parser de blocos: usar `&#123;` `&#125;` `&#64;`.
- **Linhas de código em `<pre>`** herdariam a indentação do template; por isso `.code` é `div` e cada linha tem `white-space: pre`.
- **Grid de 1 coluna precisa de `minmax(0, 1fr)`**, senão um endereço mono comprido estoura a largura no celular.
- **Fonte com `swap` gerava CLS 0,09**: fontes em `public/fonts`, URL absoluta com a base no CSS e `<link rel="preload">` no `index.html` (CLS 0).
- **Node 22 `cpSync` sai com 127** no caminho com "Programação": `pages.ts` usa `cp` de `fs/promises`. EBUSY se algum shell ficar com cwd dentro de `docs/`.
- **Git Bash reescreve argumentos que começam com `/`** (`/AWS-Desafio-Terraform/` vira caminho do Git): passar a base sem barra para scripts.
- **Lighthouse local:** o Kaspersky injeta `http://gc.kis...kaspersky-labs.com/...main.js` na página (com gzip ou brotli), o que derruba Best Practices para 82 via `is-on-https`. Medir no Chromium do Playwright com `--remote-debugging-port` + `npx lighthouse@12 --port`; o único item reprovado deve ser esse.
- **Terraform não está instalado nesta máquina**: `fmt -check` e `validate` ainda não foram rodados localmente.
