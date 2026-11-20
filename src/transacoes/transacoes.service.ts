import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transacao } from './schemas/transacao.schema';
import { CriarTransacaoDto } from './dto/criar-transacao.dto';

export function calcularMetricas(historico: Pick<Transacao, 'tipo' | 'valor' | 'consumoConsciente'>[]) {
  let saldoCentavos = 0;
  let despesasCentavos = 0;
  let impulsoCentavos = 0;

  for (const transacao of historico) {
    const valorCentavos = Math.round(transacao.valor * 100);

    if (transacao.tipo === 'receita') {
      saldoCentavos += valorCentavos;
    } else {
      saldoCentavos -= valorCentavos;
      despesasCentavos += valorCentavos;
      if (transacao.consumoConsciente === false) {
        impulsoCentavos += valorCentavos;
      }
    }
  }

  return {
    saldoTotal: saldoCentavos / 100,
    totalDespesas: despesasCentavos / 100,
    totalGastoImpulso: impulsoCentavos / 100
  };
}

@Injectable()
export class TransacoesService {
  constructor(@InjectModel(Transacao.name) private readonly modelo: Model<Transacao>) {}

  async criar(dados: CriarTransacaoDto) {
    return this.modelo.create(dados);
  }

  async listar() {
    const historico = await this.modelo.find().sort({ createdAt: -1 }).lean().exec();
    return { historico, metricas: calcularMetricas(historico) };
  }
}
