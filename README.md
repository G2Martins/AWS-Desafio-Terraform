# AWS + Terraform: VPC, EC2 e Nginx como código

**Página do projeto:** https://g2martins.github.io/AWS-Desafio-Terraform/
**Portfólio:** https://g2portfolio.grovicdata.com/projetos/aws-terraform/

Desafio técnico de processo seletivo (VExpenses, outubro de 2024): partir de um `main.tf` base, descrever cada recurso,
reforçar a segurança, instalar o Nginx automaticamente na EC2 e documentar tudo. O arquivo entregue continua intacto
em [`main.tf`](main.tf) (o estado anterior à página está na tag `v1-original`). A página mostra o código destacado, um
diagrama clicável da arquitetura e uma revisão feita em 2026.

## O que o `main.tf` cria

| Recurso | Para quê |
|---|---|
| `aws_vpc.main_vpc` | VPC `10.0.0.0/16` com DNS e hostnames |
| `aws_subnet.main_subnet` | Sub-rede pública `10.0.1.0/24` em `us-east-1a` |
| `aws_internet_gateway.main_igw` + `aws_route_table` + associação | Rota `0.0.0.0/0` para a internet |
| `aws_security_group.main_sg` | Entrada só SSH (22) de `203.0.113.0/24`; saída só 80 e 443 |
| `data.aws_ami.debian12` + `aws_instance.debian_ec2` | EC2 `t2.micro` Debian 12, IP público, `user_data` que instala e habilita o Nginx |
| `tls_private_key` + `aws_key_pair` | Par de chaves RSA 2048 gerado pelo Terraform (chave privada em output sensível) |
| `aws_s3_bucket.backup_bucket` | Bucket de backup com versionamento |
| `aws_iam_user` + `aws_iam_policy` + anexo | Usuário IAM com política `ec2:*` e `s3:*` |

## Revisão de 2026 (o que impede o `apply` hoje)

Leitura do código, sem aplicar na AWS. O arquivo foi mantido como entregue.

1. `aws_route_table_association` não aceita `tags` (o `terraform validate` acusa argumento não suportado).
2. `security_groups` (nomes) só vale na VPC padrão; numa VPC própria use `vpc_security_group_ids = [aws_security_group.main_sg.id]`.
3. O nome do bucket resolve para `VExpenses-SeuNome-backup`, mas o S3 só aceita minúsculas (e o nome é global). O bloco
   `versioning` embutido está obsoleto desde o provider 4 (o recurso atual é `aws_s3_bucket_versioning`).
4. `203.0.113.0/24` é faixa de documentação (RFC 5737): troque pelo seu IP `/32`.
5. Não há regra de entrada na porta 80: o Nginx roda, mas não é alcançável de fora.

Endurecimento para produção: SSM Session Manager no lugar de SSH, IMDSv2 obrigatório (`http_tokens = "required"`),
state remoto no S3 com criptografia e lock, `default_tags` no provider, `required_providers` com versões fixas, disco
`gp3` cifrado, política IAM com ações e recursos específicos e papel com credencial temporária no lugar de usuário IAM.

## Como rodar

Pré-requisitos: Terraform CLI 1.x, AWS CLI v2 e uma conta AWS de estudo (nunca produção, nunca o usuário root). Aplique
antes os ajustes da revisão.

**Credenciais:** nenhuma no código. Use login temporário (`aws configure sso`, `aws sso login --profile desafio` e
`AWS_PROFILE=desafio`) ou, no CI, papel assumido via OIDC. O `.gitignore` barra `.terraform/`, `*.tfstate*`, `*.tfplan`
e `*.pem`.

```bash
terraform init
terraform fmt -check && terraform validate
terraform plan -out plano.tfplan
terraform apply plano.tfplan
terraform output ec2_public_ip
terraform output -raw private_key > chave.pem && chmod 400 chave.pem   # fica só na sua máquina
ssh -i chave.pem admin@<ip-publico>
terraform destroy                                                       # ao terminar
```

**Custo:** `t2.micro`, 20 GB de EBS e o IPv4 público cabem no free tier clássico (contas anteriores a 15/07/2025, 12
meses); contas novas usam o plano gratuito com créditos. O bucket versionado cobra por armazenamento, e com objetos
dentro o `destroy` falha (`BucketNotEmpty`) até você esvaziá-lo. Confira os preços da AWS antes de aplicar.

## A página (`site/`)

Angular 21.2 com prerender (SSG), Tailwind v4, Geist/Geist Mono self-hosted, linguagem visual Valerium. O destaque de
sintaxe roda no build: `site/scripts/code.ts` lê todo `.tf`/`.sh` da raiz e gera `site/src/app/data/code.json`
(tokens por linha + índice de linhas por endereço Terraform, usado pelos links do diagrama). O corpo da página é
`@defer (hydrate never)`: HTML estático, e o código do componente nunca é baixado.

```bash
cd site
npm install
npm start            # dev: http://localhost:4200/AWS-Desafio-Terraform/
npm run build:pages  # tokens + build + check + copia para ../docs (GitHub Pages: main, /docs)
npm run og           # imagem OG 1200x630 + ícones PNG (Playwright, Python)
```

`npm run check` falha se faltar SEO (título, descrição, canonical, OG, JSON-LD), se algum link interno não terminar em
`/`, se uma âncora `#L..` não existir, se o lexer não reconstruir o arquivo exato, se houver travessão longo no texto ou
se aparecer qualquer padrão de chave de acesso AWS.

---

Projeto de portfólio de Gustavo Martins Gripaldi · [g2portfolio.grovicdata.com](https://g2portfolio.grovicdata.com/)
