const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function buscarElemento(id) {
  return document.getElementById(id);
}

function mostrarMensagem(texto, erro = false) {
  const mensagem = buscarElemento('mensagem');
  mensagem.textContent = texto;
  mensagem.className = erro ? 'error' : 'success';
}

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) {
    elemento.className = classe;
  }
  if (texto !== undefined) {
    elemento.textContent = texto;
  }
  return elemento;
}

function mostrarHistorico(transacoes) {
  const areaHistorico = buscarElemento('historico');
  areaHistorico.replaceChildren();

  if (transacoes.length === 0) {
    areaHistorico.append(criarElemento('p', 'empty', 'Nenhuma transação cadastrada ainda.'));
    return;
  }

  for (const transacao of transacoes) {
    const item = criarElemento('article', 'item');
    const informacoes = criarElemento('div');
    informacoes.append(criarElemento('strong', '', transacao.descricao));

    let classificacao = 'Receita';
    if (transacao.tipo === 'despesa') {
      classificacao = transacao.consumoConsciente ? 'Despesa consciente' : 'Gasto por impulso';
    }

    informacoes.append(criarElemento('small', '', transacao.categoria + ' • ' + classificacao));

    const sinal = transacao.tipo === 'despesa' ? '- ' : '+ ';
    const classeValor = transacao.tipo === 'despesa' ? 'amount out' : 'amount';
    const valor = criarElemento('span', classeValor, sinal + formatadorMoeda.format(transacao.valor));
    item.append(informacoes, valor);
    areaHistorico.append(item);
  }
}

async function carregarTransacoes() {
  try {
    const resposta = await fetch('/transacoes');
    if (!resposta.ok) {
      throw new Error('Erro ao consultar transações (HTTP ' + resposta.status + ').');
    }

    const dados = await resposta.json();
    if (!dados.metricas || !Array.isArray(dados.historico)) {
      throw new Error('A API retornou dados inesperados.');
    }

    // Os cálculos financeiros são realizados pelo servidor.
    buscarElemento('saldo').textContent = formatadorMoeda.format(dados.metricas.saldoTotal);
    buscarElemento('despesas').textContent = formatadorMoeda.format(dados.metricas.totalDespesas);
    buscarElemento('impulso').textContent = formatadorMoeda.format(dados.metricas.totalGastoImpulso);
    mostrarHistorico(dados.historico);
  } catch (erro) {
    buscarElemento('historico').replaceChildren(
      criarElemento('p', 'empty', erro.message + ' Verifique o servidor e o MongoDB.')
    );
  }
}

async function salvarTransacao(evento) {
  evento.preventDefault();

  const botaoSalvar = buscarElemento('salvar');
  const opcaoConsciente = document.querySelector('input[name="consciente"]:checked');
  const transacao = {
    descricao: buscarElemento('descricao').value.trim(),
    valor: Number(buscarElemento('valor').value),
    tipo: buscarElemento('tipo').value,
    categoria: buscarElemento('categoria').value,
    consumoConsciente: opcaoConsciente.value === 'true'
  };

  if (transacao.descricao.length < 2 || !Number.isFinite(transacao.valor) || transacao.valor <= 0) {
    mostrarMensagem('Informe uma descrição e um valor maior que zero.', true);
    return;
  }

  botaoSalvar.disabled = true;
  mostrarMensagem('Salvando...');

  try {
    const resposta = await fetch('/transacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transacao)
    });

    if (!resposta.ok) {
      throw new Error('Erro ao salvar a transação (HTTP ' + resposta.status + ').');
    }

    buscarElemento('form').reset();
    mostrarMensagem('Transação cadastrada com sucesso!');
    await carregarTransacoes();
  } catch (erro) {
    mostrarMensagem(erro.message + ' Verifique a conexão com o servidor.', true);
  } finally {
    botaoSalvar.disabled = false;
  }
}

buscarElemento('form').addEventListener('submit', salvarTransacao);
buscarElemento('atualizar').addEventListener('click', carregarTransacoes);
carregarTransacoes();
