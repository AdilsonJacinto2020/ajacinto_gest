import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

// Entrada para a Vercel (função serverless).
// A app Nest arranca UMA vez por instância e é reutilizada nos pedidos seguintes.
// Guardamos a "promessa" do arranque (não só o resultado): se chegarem vários pedidos
// ao mesmo tempo com a instância ainda fria, todos esperam pelo mesmo arranque em vez
// de cada um criar a sua própria app e ligações à base de dados.
type Handler = (req: any, res: any) => void;
let booting: Promise<Handler> | null = null;

function bootstrap(): Promise<Handler> {
  if (!booting) {
    booting = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter());
      const origins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean);
      app.enableCors({
        origin: origins && origins.length ? origins : '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, x-admin-key',
      });
      await app.init();
      return app.getHttpAdapter().getInstance() as Handler;
    })().catch((err) => {
      booting = null; // se falhar (ex.: base de dados em arranque), o próximo pedido tenta de novo
      throw err;
    });
  }
  return booting;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
