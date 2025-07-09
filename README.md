# Serviço de pagamentos

> Este projeto é parte da terceira edição da rinha de backend 2025 [site do evento](https://github.com/zanfranceschi/rinha-de-backend-2025)

![Hono](https://raw.githubusercontent.com/honojs/hono/main/logo.svg)

Um projeto HonoJS.

## Stack

- [HonoJS](https://hono.dev/): Framework web leve para construir APIs.
- [TypeScript](https://www.typescriptlang.org/): Superset de JavaScript que adiciona tipagem estática.
- [Node.js](https://nodejs.org/en/): Ambiente de execução JavaScript. (LTS 22)

## Pré-requisitos

- [Node.js](https://nodejs.org/en/download/) (LTS 22)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Instalação

1.  Clone o repositório:

    ```bash
    git clone <seu-repositorio>
    cd rinha_ed3_payment

    ```

# rinha_ed3_payment

![Hono](https://raw.githubusercontent.com/honojs/hono/main/logo.svg)

Um projeto HonoJS.

## Stack

- [HonoJS](https://hono.dev/): Framework web leve para construir APIs.
- [TypeScript](https://www.typescriptlang.org/): Superset de JavaScript que adiciona tipagem estática.
- [Node.js](https://nodejs.org/en/): Ambiente de execução JavaScript. (LTS 22)

## Pré-requisitos

- [Node.js](https://nodejs.org/en/download/) (LTS 22)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Instalação

1.  Clone o repositório:

```bash
git clone <seu-repositorio>
cd rinha_ed3_payment

```

2.  Instale as dependências:

```bash
npm install # ou yarn install
```

## Execução

Para executar o projeto em modo de desenvolvimento:

```bash
npm run dev # ou yarn dev
```

Isso iniciará o servidor usando `tsx watch src/index.ts` e reiniciará automaticamente em caso de alterações nos arquivos.

## Dependências

As dependências do projeto estão listadas no arquivo `package.json`.

- **Produção:**
  - `@hono/node-server`: Adaptador para executar o Hono em Node.js.
  - `@hono/zod-openapi`: Integração do Zod com OpenAPI para Hono.
  - `hone`: (A descrição dessa dependência não foi fornecida, verificar a documentação do projeto)
  - `zod`: Biblioteca de declaração e validação de esquemas.
- **Desenvolvimento:**
  - `@types/node`: Definições de tipo para Node.js.
  - `tsx`: Executor de TypeScript com suporte a JSX.

