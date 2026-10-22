import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permitir chamadas do frontend React
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 ADIJACINTO Backend (NestJS + TypeORM) rodando na porta ${port}`);
}
bootstrap();
