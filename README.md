# 💙 INESQ Hub — Central de Documentos e Automação

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.4.0-000000?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql)

O **INESQ Hub** é uma aplicação web em desenvolvimento para centralizar documentos, facilitar a organização de arquivos e, gradualmente, apoiar o acompanhamento administrativo e financeiro relacionado às atividades do INESQ e do Qualifica DF Móvel.

O projeto está sendo construído por etapas: primeiro a base visual e a autenticação; em seguida, o recebimento seguro de documentos, a conferência e os registros de acompanhamento.

> ⚠️ **Situação atual:** projeto em desenvolvimento. O recebimento de documentos já foi testado localmente, mas validação completa de conteúdo, auditoria e controles adicionais de segurança ainda estão em implementação. Não usar com documentos confidenciais em produção nesta fase.

---

## ✨ Funcionalidades

### ✅ Implementado e testado localmente

- **Autenticação:** login, sessão e saída da conta.
- **Painel inicial:** navegação lateral, saudação com o nome do usuário, indicadores visuais e atalhos.
- **Recebimento de documentos:** seleção de vários arquivos e envio em lote.
- **Registro no banco:** gravação dos metadados dos documentos e do lote recebido.
- **Documentos recentes:** consulta e exibição dos dez documentos mais recentes do setor do usuário, com nome, data e situação.
- **Sinalização de possíveis duplicados:** comparação de hash SHA-256 dentro do setor e indicação para conferência humana, sem vinculação automática.
- **Base de auditoria:** modelo inicial de registros de auditoria no banco de dados.

### 🚧 Planejado para as próximas etapas

- Validação do conteúdo real dos arquivos, além da extensão declarada.
- Conferência e correção dos dados extraídos dos documentos.
- Registro completo das ações de envio e conferência no histórico de auditoria.
- Abertura e download de arquivos por rotas privadas com autorização.
- Organização inteligente com revisão humana para casos incertos.
- Ferramentas para separar, unir, renomear e converter PDFs.
- Cadastros e acompanhamento de pessoas, empresas e instrutores.
- Gestão de contratos, serviços, parcelas e registros financeiros.
- Relatórios, filtros e indicadores calculados a partir de dados reais.
- Portal para envio por instrutores e empresas, em etapa futura.
- Armazenamento privado persistente adequado ao ambiente de implantação.

---

## 🧰 Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| [Next.js](https://nextjs.org/) | Aplicação web e rotas de API |
| [React](https://react.dev/) | Interface de usuário |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem do código |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização da interface |
| [Prisma ORM](https://www.prisma.io/) | Modelagem e acesso ao banco |
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados relacional |
| [Node.js](https://nodejs.org/) | Ambiente de execução |

---

## 🚀 Como executar localmente

### Pré-requisitos

- Node.js compatível com a versão utilizada no projeto (desenvolvido e testado com Node.js 22).
- npm.
- Uma instância PostgreSQL acessível.
- Git.

### 1. Obter o código

Clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/Staarr0101/inesq-hub.git
cd inesq-hub
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto. Preencha os valores com os dados do seu ambiente:

```dotenv
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO?schema=public"
SESSION_SECRET="substitua-por-uma-chave-longa-e-aleatoria"
```

Use credenciais próprias e uma chave secreta forte. **Nunca publique o `.env`, senhas, tokens ou dados reais.** O projeto possui configuração Prisma em `prisma7.config.ts`; mantenha a configuração de conexão consistente com esse arquivo.

### 4. Preparar o banco de dados

Depois de configurar o PostgreSQL e revisar a configuração local:

```bash
npx prisma migrate dev
npx prisma generate
```

> Execute comandos de migração apenas em um banco de desenvolvimento ou depois de confirmar que possui backup. Não use `migrate dev` indiscriminadamente em bancos de produção.

### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

No Windows PowerShell, caso a política local bloqueie os atalhos `.ps1`, é possível usar `npm.cmd` e `npx.cmd`, por exemplo `npm.cmd run dev`.

---

## 📁 Estrutura principal do projeto

```text
inesq-hub/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── documents/
│   │   │   ├── route.ts
│   │   │   └── upload/route.ts
│   │   └── health/route.ts
│   ├── painel/
│   │   ├── PainelClient.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth/
│   │   ├── current-user.ts
│   │   ├── password.ts
│   │   └── session.ts
│   └── prisma.ts
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── scripts/
│   └── create-admin.ts
├── prisma7.config.ts
├── package.json
└── README.md
```

A árvore acima apresenta os principais arquivos e pode mudar conforme novos módulos forem implementados.

---

## 🔐 Segurança e privacidade

- O acesso às páginas protegidas depende de uma sessão válida.
- Os documentos são associados ao setor e ao usuário que os enviou.
- Os arquivos recebidos são armazenados fora da pasta pública `public` no ambiente local atual.
- O `.gitignore` exclui `.env` e `storage/` para reduzir o risco de publicar segredos ou documentos locais.
- A comparação de SHA-256 é usada para **sinalizar** possíveis duplicados; não realiza associação automática.
- Receber um arquivo **não significa** que uma parcela foi paga ou que um comprovante foi validado.

### Antes de usar em produção

Ainda é necessário completar e testar a validação de conteúdo por tipo de arquivo, a verificação de malware, a proteção de arquivos grandes ou malformados, a autorização de acesso e download, a auditoria de ações, o tratamento de falhas entre armazenamento e banco de dados e o armazenamento privado persistente no ambiente de implantação. Também é necessário revisar o histórico Git antes de tornar o repositório público, para confirmar que nenhum segredo ou dado confidencial foi incluído em commits anteriores.

---

## 🗺️ Direção do projeto

O desenvolvimento seguirá etapas incrementais, preservando as decisões registradas no planejamento do INESQ Hub:

1. Consolidar o painel e a experiência visual.
2. Tornar o recebimento e a conferência de documentos seguros e rastreáveis.
3. Construir a organização documental e as ferramentas de PDF.
4. Implementar cadastros, contratos, serviços e acompanhamento de parcelas.
5. Conectar indicadores e relatórios aos dados reais.
6. Avaliar automações inteligentes e um portal externo para remetentes.

A ordem pode ser ajustada de acordo com os testes, os requisitos operacionais e as prioridades do projeto.

---

## 📝 Observações

- Os indicadores da página inicial ainda não estão conectados a consultas reais para todos os módulos.
- A interface de algumas áreas é estrutural e indica funcionalidades planejadas, não implementadas.
- O armazenamento local em `storage/` é apropriado para desenvolvimento controlado, mas não deve ser considerado solução de produção ou de alta disponibilidade.
- O banco de dados e os arquivos armazenados precisam de backups próprios; commits Git não são backup do conteúdo do banco nem dos documentos.

---

**INESQ Hub** — organização documental, rastreabilidade e automação construídas por etapas. 💙
