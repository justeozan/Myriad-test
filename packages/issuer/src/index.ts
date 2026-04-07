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

    const credential: VerifiableCredential = {
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

    return { credential };
  }

  getDID(): string {
    return this.config.did;
  }
}

export type { IssuerConfig, CredentialRequest, IssuedCredential } from './types.js';
