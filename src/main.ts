import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function iniciarAplicacao() {
  const aplicacao = await NestFactory.create(AppModule);
  aplicacao.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  const porta = Number(process.env.PORT || 3000);
  await aplicacao.listen(porta);
  console.log('Controle Financeiro: http://localhost:' + porta);
}

void iniciarAplicacao();
