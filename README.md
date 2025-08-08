# Serviço de pagamentos

> Este projeto é parte da terceira edição da rinha de backend 2025 [site do evento](https://github.com/zanfranceschi/rinha-de-backend-2025)

<div align="center">
  <a href="https://hono.dev">
    <img src="https://raw.githubusercontent.com/honojs/hono/main/docs/images/hono-title.png" width="500" height="auto" alt="Hono"/>
  </a>
</div>

## Stack

- [HonoJS](https://hono.dev/): Framework web leve para construir APIs.
- [TypeScript](https://www.typescriptlang.org/): Superset de JavaScript que adiciona tipagem estática.
- [Node.js](https://nodejs.org/en/): Ambiente de execução JavaScript. (LTS 22)

## Pré-requisitos

- [Node.js](https://nodejs.org/en/download/) (LTS 22)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Produção

Variaveis de ambiente necessárias:

- REDIS_URL
- PAYMENT_PROCESSOR_URL_DEFAULT
- PAYMENT_PROCESSOR_URL_FALLBACK

## Desenvolvimento

### Instalação

1.  Clone o repositório:

```bash
git clone <seu-repositorio> rinha
cd rinha

```

2.  Instale as dependências:

```bash
npm install # ou yarn install
```

### Execução

Para executar o projeto em modo de desenvolvimento:

```bash
npm run dev # ou yarn dev
```

Isso iniciará o servidor usando `tsx watch src/index.ts` e reiniciará automaticamente em caso de alterações nos arquivos.

## Dependências

As dependências do projeto estão listadas no arquivo `package.json`.


- `hono`: Micro framework web
- `@hono/node-server`: Adaptador para executar o Hono em Node.js.
- `@hono/zod-openapi`: Integração do Zod com OpenAPI para Hono.
- `zod`: Biblioteca de declaração e validação de esquemas.
- `redisio`: Biblioteca para acesso ao memory database Redis


