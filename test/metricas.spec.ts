import { calcularMetricas } from '../src/transacoes/transacoes.service';

describe('Métricas financeiras calculadas no back-end', () => {
  it('soma receitas, despesas e gastos por impulso', () => {
    const dados = [
      { tipo: 'receita' as const, valor: 3000, consumoConsciente: true },
      { tipo: 'despesa' as const, valor: 800, consumoConsciente: true },
      { tipo: 'despesa' as const, valor: 200, consumoConsciente: false }
    ];
    expect(calcularMetricas(dados)).toEqual({
      saldoTotal: 2000,
      totalDespesas: 1000,
      totalGastoImpulso: 200
    });
  });

  it('retorna zero para histórico vazio', () => {
    expect(calcularMetricas([])).toEqual({
      saldoTotal: 0,
      totalDespesas: 0,
      totalGastoImpulso: 0
    });
  });
});
