const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

// Testa a interface usando respostas simuladas da API.
test('formulário envia POST e atualiza métricas e histórico pelo GET', async () => {
  const elementos = {};
  function elemento(id) {
    if (!elementos[id]) {
      elementos[id] = {
        value: '', textContent: '', className: '', disabled: false,
        children: [],
        append(...itens) { this.children.push(...itens); },
        replaceChildren(...itens) { this.children = itens; },
        addEventListener(tipo, callback) { this[tipo] = callback; },
        reset() { this.resetado = true; }
      };
    }
    return elementos[id];
  }

  elemento('descricao').value = 'Mercado';
  elemento('valor').value = '50';
  elemento('tipo').value = 'despesa';
  elemento('categoria').value = 'Alimentação';

  const requisicoes = [];
  const transacoes = [];
  const contexto = {
    Intl, Number, Error,
    document: {
      getElementById: elemento,
      querySelector: () => ({ value: 'false' }),
      createElement: (tag) => ({
        tag,
        append(...itens) { this.children = itens; }
      })
    },
    fetch: async (url, opcoes = {}) => {
      requisicoes.push({ url, metodo: opcoes.method || 'GET' });
      if (opcoes.method === 'POST') {
        transacoes.push(JSON.parse(opcoes.body));
      }
      return {
        ok: true,
        json: async () => ({
          historico: transacoes,
          metricas: {
            saldoTotal: -50 * transacoes.length,
            totalDespesas: 50 * transacoes.length,
            totalGastoImpulso: 50 * transacoes.length
          }
        })
      };
    }
  };

  vm.runInNewContext(fs.readFileSync('src/public/js/main.js', 'utf8'), contexto);
  await elemento('form').submit({ preventDefault() {} });

  assert.equal(requisicoes.filter(r => r.metodo === 'POST').length, 1);
  assert.ok(requisicoes.filter(r => r.metodo === 'GET').length >= 2);
  assert.equal(transacoes[0].consumoConsciente, false);
  assert.match(elemento('despesas').textContent, /50,00/);
  assert.equal(elemento('historico').children.length, 1);
});
