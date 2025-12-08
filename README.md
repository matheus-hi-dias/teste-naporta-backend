# Backend do Projeto

Este é o backend do projeto, desenvolvido em TypeScript e Node.js.

## Pré-requisitos

Antes de começar, você vai precisar ter as seguintes ferramentas instaladas em sua máquina:

- [Node.js](https://nodejs.org/en/) (versão 16 ou superior recomendada)
- [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)

## 🚀 Instalação

1.  Clone o repositório para a sua máquina.
2.  Navegue até o diretório `backend`.
3.  Instale as dependências do projeto:

```bash
npm install
```

## ⚙️ Executando a Aplicação

Para executar a aplicação, você precisará copiar o arquivo `.env.example` e renomear para `.env` na raiz do diretório `backend` para configurar as variáveis de ambiente.

Após isso, você deve rodar o comando para iniciar seu banco de dados

```bash
npx prisma migrate dev --name init
```

O segundo comando a ser rodado é o de seed, para popular o banco de dados

```bash
npm run seed
```

Por fim, para rodar o projeto, use o comando

```bash
npm run start:dev

```
