# Web Mobile — Aula 8

Projeto acadêmico de controle financeiro pessoal com NestJS, MongoDB e interface HTML, CSS e JavaScript Mobile First.

## Execução

1. Instale Node.js 22+ e execute `npm install`.
2. Copie `.env.example` para `.env` e configure `MONGODB_URI` com sua conexão MongoDB Atlas.
3. Execute `npm run start:dev` e acesse `http://localhost:3000`.
4. Para testes, execute `npm test` (exige MongoDB de teste quando indicado).

A API disponibiliza `GET /transacoes` e `POST /transacoes`. Os indicadores financeiros são calculados no Service.

Não publique o arquivo `.env` nem credenciais.
