import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'crypto';
import { SignJWT } from 'jose';
import { verifySignature, resolveDID } from '@myriad/wallet';

const challenges = new Map<string, { nonce: string; expiresAt: number }>();

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'myriad-identity-secret-change-in-production'
);

export default async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/challenge', async (_request, reply) => {
    const challenge = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 5 * 60 * 1000;
    challenges.set(challenge, { nonce: challenge, expiresAt });

    for (const [key, val] of challenges.entries()) {
      if (val.expiresAt < Date.now()) challenges.delete(key);
    }

    reply.send({ challenge });
  });

  fastify.post<{ Body: { did: string; challenge: string; signature: string } }>('/verify', {
    schema: {
      body: {
        type: 'object',
        required: ['did', 'challenge', 'signature'],
        properties: {
          did: { type: 'string' },
          challenge: { type: 'string' },
          signature: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { did, challenge, signature } = request.body;

    const stored = challenges.get(challenge);
    if (!stored || stored.expiresAt < Date.now()) {
      reply.status(400).send({ verified: false, error: 'Invalid or expired challenge' });
      return;
    }

    const resolution = await resolveDID(did);
    if (!resolution.didDocument) {
      reply.status(400).send({ verified: false, error: 'Could not resolve DID' });
      return;
    }

    const verificationMethod = resolution.didDocument.verificationMethod[0];
    if (!verificationMethod?.publicKeyMultibase) {
      reply.status(400).send({ verified: false, error: 'No public key in DID document' });
      return;
    }

    const { base58btc } = await import('multiformats/bases/base58');
    const decoded = base58btc.decode(verificationMethod.publicKeyMultibase);
    const publicKeyBytes = decoded.slice(2);

    const messageBytes = new TextEncoder().encode(challenge);
    const signatureBytes = Uint8Array.from(Buffer.from(signature, 'hex'));

    const verified = await verifySignature(messageBytes, signatureBytes, publicKeyBytes);

    if (!verified) {
      reply.status(401).send({ verified: false, error: 'Signature verification failed' });
      return;
    }

    challenges.delete(challenge);

    const token = await new SignJWT({ sub: did, did })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(JWT_SECRET);

    reply.send({ verified: true, token });
  });
}
