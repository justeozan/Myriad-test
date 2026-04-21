import type { FastifyInstance } from 'fastify';
import { generateDID, resolveDID } from '@myriad/wallet';

export default async function didRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/generate', async (_request, reply) => {
    const result = await generateDID();
    reply.send({
      did: result.did,
      document: result.document,
      publicKey: Buffer.from(result.publicKey).toString('hex'),
      privateKey: Buffer.from(result.privateKey).toString('hex'),
    });
  });

  fastify.post<{ Body: { did: string } }>('/resolve', {
    schema: {
      body: {
        type: 'object',
        required: ['did'],
        properties: { did: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { did } = request.body;
    const result = await resolveDID(did);
    if (!result.didDocument) {
      reply.status(404).send({ error: result.didResolutionMetadata.error ?? 'DID not found' });
      return;
    }
    reply.send(result.didDocument);
  });
}
