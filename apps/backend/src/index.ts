import Fastify from 'fastify';
import corsPlugin from './plugins/cors.js';
import healthRoutes from './routes/health.js';

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

  // API route prefixes for future implementation
  server.log.info('Routes registered: /health, /api/did (future), /api/vc (future), /api/verify (future), /api/auth (future)');

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
