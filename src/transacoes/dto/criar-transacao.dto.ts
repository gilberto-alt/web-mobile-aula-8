import { IsBoolean, IsIn, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CriarTransacaoDto {
  @IsString()
  @MinLength(2)
  descricao!: string;

  @IsNumber()
  @Min(0.01)
  valor!: number;

  @IsIn(['receita', 'despesa'])
  tipo!: 'receita' | 'despesa';

  @IsString()
  @MinLength(2)
  categoria!: string;

  @IsBoolean()
  consumoConsciente!: boolean;
}
