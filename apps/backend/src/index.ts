import Fastify from 'fastify';
import corsPlugin from './plugins/cors.js';
import healthRoutes from './routes/health.js';
import didRoutes from './routes/did.js';
import vcRoutes from './routes/vc.js';
import authRoutes from './routes/auth.js';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
});

async function start(): Promise<void> {
  await server.register(corsPlugin);
  await server.register(healthRoutes);
  await server.register(didRoutes, { prefix: '/api/did' });
  await server.register(vcRoutes, { prefix: '/api/vc' });
  await server.register(authRoutes, { prefix: '/api/auth' });

  const port = parseInt(process.env.PORT ?? '3001', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  try {
    await server.listen({ port, host });
    server.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

