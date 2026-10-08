# INESQ Hub — Arquitetura

## Objetivo

O INESQ Hub é uma plataforma para centralizar, organizar e automatizar
o gerenciamento de documentos relacionados às atividades do INESQ.

## Visão geral

O sistema será desenvolvido inicialmente como uma aplicação web.

A versão mobile será considerada posteriormente, após a estabilização
da versão web.

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS
- Git
- GitHub

## Estrutura principal

### app

Responsável pelas páginas e rotas da aplicação.

### components

Responsável pelos componentes visuais reutilizáveis.

### lib

Responsável pela lógica de negócio e serviços internos.

### docs

Responsável pela documentação técnica e funcional do projeto.

### tests

Responsável pelos testes automatizados.

## Princípios

- Código simples e legível.
- Separação entre interface e lógica de negócio.
- Evitar dependência desnecessária de bibliotecas.
- Regras importantes devem ser determinadas pelo sistema e pelo banco de dados.
- Inteligência artificial deve atuar como apoio à classificação e extração de informações.
- O sistema não deve depender de um único provedor de inteligência artificial.

## Evolução prevista

### V1

Ferramentas básicas para manipulação de PDFs.

### V1.x

Leitura, classificação e organização inteligente de documentos.

### V2

Cadastro de instrutores, serviços, contratos e controle de parcelas.

### V3

Portal para envio direto de documentos pelos instrutores.

### V4

Automação do fluxo de recebimento, análise, registro e acompanhamento
de documentos.

## Mobile

A aplicação mobile será considerada somente após a versão web estar
estável e validada.