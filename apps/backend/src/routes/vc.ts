import type { FastifyInstance } from 'fastify';
import { Issuer } from '@myriad/issuer';
import { Verifier } from '@myriad/verifier';
import type { VerifiableCredential } from '@myriad/shared';

interface IssueBody {
  issuerDid: string;
  issuerPrivateKey: string; // hex
  subjectDid: string;
  type: string[];
  claims: Record<string, unknown>;
  expiresIn?: number;
}

interface VerifyBody {
  credential: VerifiableCredential;
}

export default async function vcRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: IssueBody }>('/issue', {
    schema: {
      body: {
        type: 'object',
        required: ['issuerDid', 'issuerPrivateKey', 'subjectDid', 'type', 'claims'],
        properties: {
          issuerDid: { type: 'string' },
          issuerPrivateKey: { type: 'string' },
          subjectDid: { type: 'string' },
          type: { type: 'array', items: { type: 'string' } },
          claims: { type: 'object' },
          expiresIn: { type: 'number' },
        },
      },
    },
  }, async (request, reply) => {
    const { issuerDid, issuerPrivateKey, subjectDid, type, claims, expiresIn } = request.body;

    const privateKeyBytes = Uint8Array.from(Buffer.from(issuerPrivateKey, 'hex'));
    const { getPublicKeyAsync } = await import('@noble/ed25519');
    const publicKeyBytes = await getPublicKeyAsync(privateKeyBytes);

    const issuer = new Issuer({
      did: issuerDid,
      privateKey: privateKeyBytes,
      publicKey: publicKeyBytes,
    });

    const result = await issuer.issueCredential({
      subjectDid,
      type,
      claims,
      ...(expiresIn !== undefined && { expiresIn }),
    });

    reply.send(result.credential);
  });

  fastify.post<{ Body: VerifyBody }>('/verify', {
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    schema: {
      body: {
        type: 'object',
        required: ['credential'],
        properties: {
          credential: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const { credential } = request.body;
    const verifier = new Verifier();
    const result = await verifier.verifyCredential(credential);

    const errors = result.checks
      .filter(c => !c.passed)
      .map(c => c.message ?? c.check);

    reply.send({
      valid: result.verified,
      ...(errors.length > 0 && { errors }),
    });
  });
}
