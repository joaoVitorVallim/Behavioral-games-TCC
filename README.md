## 🚀 Guia de Clonagem e Execução do Projeto com Prisma

### 1\. Pré-requisitos

Certifique-se de ter os seguintes itens instalados:

  * **Node.js** (versão LTS recomendada)
  * **npm** ou **Yarn** (gerenciador de pacotes)
  * **Git**
  * **Servidor de Banco de Dados** (PostgreSQL).

-----

### 2\. Clonagem e Instalação

#### 2.1. Clonar o Repositório

Abra seu terminal e clone o projeto:

```bash
git clone git@github.com:joaoVitorVallim/Behavioral-games-TCC.git
cd behavioral-games-tcc
```

#### 2.2. Instalar Dependências

Instale todas as dependências do projeto:

```bash
# Se estiver usando npm
npm install

# Ou se estiver usando Yarn
yarn install
```

-----

### 3\. Configuração do Ambiente e Banco de Dados

#### 3.1. Variáveis de Ambiente

Crie um arquivo chamado **`.env`** na raiz do projeto e configure a URL de conexão do banco de dados, além de outras variáveis necessárias:

```
# Exemplo para PostgreSQL
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?schema=public"

# Outras variáveis, como PORTA do servidor
PORT=3000
```

#### 3.2. Inicializar o Banco de Dados

> 💡 **Nota:** Certifique-se de que o **HOST**, **PORTA**, **USUARIO** e **SENHA** na sua `DATABASE_URL` correspondem às configurações do seu banco de dados local.

-----

### 4\. Configuração do Prisma

Esses são os passos cruciais para um projeto com Prisma.

#### 4.1. Aplicar Migrações

Aplique as migrações existentes para criar as tabelas no seu banco de dados. Este comando é o mais seguro para ambientes que já possuem migrações definidas:

```bash
npx prisma migrate deploy
```

> ⚠️ **Alternativa para Desenvolvimento:** Se você estiver começando do zero e quiser rodar as migrações e *seeds* de desenvolvimento:
>
> ```bash
> npx prisma migrate dev --name init
> ```

#### 4.2. Gerar o Cliente Prisma

Gere o cliente do Prisma para que o código da aplicação consiga interagir com o banco de dados:

```bash
npx prisma generate
```

#### 4.3. Validar o Schema (Verificação Opcional)

Use este comando para verificar se o seu arquivo `schema.prisma` não contém erros de sintaxe ou configuração:

```bash
npx prisma validate
```

-----

### 5\. Execução do Projeto

Com as dependências instaladas e o banco de dados configurado, você pode iniciar o servidor.

Inicie o projeto em modo de desenvolvimento (o comando pode variar, mas `start:dev` é o padrão NestJS/muitos projetos Node):

```bash
# Usando npm
npm run start:dev

# Ou usando Yarn
yarn start:dev
```

O projeto estará acessível no endereço definido: `http://localhost:3000`.