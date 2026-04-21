import { signData } from '@myriad/wallet';
import type { IssuerConfig, CredentialRequest, IssuedCredential } from './types.js';
import type { VerifiableCredential } from '@myriad/shared';

export class Issuer {
  private config: IssuerConfig;

  constructor(config: IssuerConfig) {
    this.config = config;
  }

  async issueCredential(request: CredentialRequest): Promise<IssuedCredential> {
    const now = new Date();
    const issuanceDate = now.toISOString();
    const expirationDate = request.expiresIn
      ? new Date(now.getTime() + request.expiresIn * 1000).toISOString()
      : undefined;

    const credentialBody: Omit<VerifiableCredential, 'proof'> = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
      ],
      type: ['VerifiableCredential', ...request.type],
      issuer: this.config.did,
      issuanceDate,
      ...(expirationDate && { expirationDate }),
      credentialSubject: {
        id: request.subjectDid,
        ...request.claims,
      },
    };

    // Sort keys for canonical signing
    const sortedKeys = Object.keys(credentialBody).sort() as (keyof typeof credentialBody)[];
    const canonical: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      canonical[key] = credentialBody[key as keyof typeof credentialBody];
    }

    const encoded = new TextEncoder().encode(JSON.stringify(canonical));
    const signatureBytes = await signData(encoded, this.config.privateKey);
    const proofValue = Buffer.from(signatureBytes).toString('base64url');

    const did = this.config.did;
    const keyFragment = did.startsWith('did:key:') ? did.split(':')[2] : '';
    const verificationMethod = keyFragment ? `${did}#${keyFragment}` : `${did}#key-1`;

    const credential: VerifiableCredential = {
      ...credentialBody,
      proof: {
        type: 'Ed25519Signature2020',
        proofPurpose: 'assertionMethod',
        verificationMethod,
        created: now.toISOString(),
        proofValue,
      },
    };

    return { credential };
  }

  getDID(): string {
    return this.config.did;
  }
}

export type { IssuerConfig, CredentialRequest, IssuedCredential, SignedCredentialRequest } from './types.js';

