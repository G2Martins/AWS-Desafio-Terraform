
# Terraform AWS Infraestrutura

## Descrição Técnica

Este projeto usa o Terraform para provisionar uma infraestrutura básica na AWS. O código define e implementa os seguintes recursos:

1. **Provedor AWS**: Define o provedor AWS na região `us-east-1`.
2. **Variáveis**: Variáveis para o nome do projeto e do candidato, usadas para personalizar os nomes dos recursos.
3. **Par de Chaves**:
   - Gera uma chave privada RSA (2048 bits) para acesso à instância EC2.
   - Cria um par de chaves na AWS usando a chave pública gerada.
4. **VPC (Virtual Private Cloud)**:
   - Cria uma VPC com o bloco CIDR `10.0.0.0/16`.
   - Habilita DNS e hostnames.
5. **Subrede**:
   - Cria uma subrede dentro da VPC com o bloco CIDR `10.0.1.0/24`.
   - Localizada na zona de disponibilidade `us-east-1a`.
6. **Internet Gateway**:
   - Cria um Internet Gateway para permitir a comunicação da VPC com a internet.
7. **Tabela de Rotas**:
   - Cria uma tabela de rotas que permite o tráfego de saída para a internet.
8. **Associação da Tabela de Rotas**:
   - Associa a tabela de rotas criada à subrede.
9. **Grupo de Segurança**:
   - Permite o tráfego SSH (porta 22) de qualquer lugar.
   - Permite todo o tráfego de saída.
10. **Instância EC2**:
   - Cria uma instância EC2 do tipo `t2.micro` usando uma AMI Debian 12.
   - Define as configurações básicas da instância, como volume de armazenamento e segurança.
   - Inclui um script básico de `user_data` que realiza atualizações do sistema ao iniciar a instância.
11. **Outputs**:
   - Exibe a chave privada para acessar a instância EC2.
   - Exibe o endereço IP público da instância EC2.

## Alterações Realizadas

### 1. **Melhorias de Segurança**
- **SSH Restrito**: O acesso SSH foi limitado ao intervalo de IPs `203.0.113.0/24`, restringindo o acesso apenas a IPs confiáveis.
- **Tráfego de Saída Restrito**: As regras de saída foram ajustadas para permitir apenas tráfego nas portas HTTP (80) e HTTPS (443), restringindo outros tipos de tráfego que poderiam expor o sistema.

### 2. **Automação da Instalação do Nginx**
- O script `user_data` foi atualizado para realizar a instalação automática do Nginx na instância EC2 logo após sua criação.
- Comandos adicionados no script:
  - Instalação do Nginx via `apt-get install nginx`.
  - Inicialização e habilitação do Nginx para iniciar automaticamente com o sistema.

### 3. **Backup na Nuvem com S3**
- Um bucket S3 foi criado para armazenar backups. O bucket possui versionamento habilitado, garantindo que diferentes versões de arquivos podem ser salvas para recuperação futura. Isso proporciona maior segurança e controle sobre os dados armazenados.

### 4. **Controle de Acesso com IAM**
- Um usuário IAM foi criado com permissões limitadas para o gerenciamento de recursos EC2 e S3. Isso garante que o acesso ao gerenciamento da infraestrutura e backups é restrito, promovendo uma política de segurança mínima necessária.
- Uma política personalizada foi aplicada ao usuário, permitindo ações específicas apenas sobre os recursos necessários (EC2 e S3).


## Instruções de Uso

### 🛠️ Pré-requisitos
- **Terraform**: Certifique-se de que o Terraform está instalado. [Instruções de instalação](https://learn.hashicorp.com/tutorials/terraform/install-cli).
- **AWS CLI**: Configure suas credenciais AWS usando o AWS CLI.

### Configuração
1. Clone o repositório e navegue até o diretório do projeto.
   ```bash
   git clone <repositório>
   cd <diretório-do-projeto>
   ```
2. Inicialize o Terraform no diretório.
   ```bash
   terraform init
   ```
3. Visualize o plano de execução para verificar o que será criado.
   ```bash
   terraform plan
   ```
4. Aplique as mudanças para criar a infraestrutura na AWS.
   ```bash
   terraform apply
   ```
   Confirme a aplicação digitando `yes` quando solicitado.

5. Após a aplicação bem-sucedida, os seguintes outputs estarão disponíveis:
   - **Chave Privada**: A chave privada gerada para acessar a instância EC2.
   - **Endereço IP Público**: O IP público da instância EC2 criada.

### Acessando a Instância EC2
1. Salve a chave privada em um arquivo `.pem` e altere suas permissões:
   ```bash
   echo "<conteúdo da chave privada>" > my-key.pem
   chmod 400 my-key.pem
   ```
2. Conecte-se à instância EC2 via SSH:
   ```bash
   ssh -i my-key.pem admin@<endereço-ip-público>
   ```

A instância já estará configurada com o Nginx rodando no servidor ✅.

## 📚 Documentação
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
