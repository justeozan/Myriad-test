import type { VerifiableCredential, DIDString } from '@myriad/shared';

export interface IssuerConfig {
  did: DIDString;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

export interface CredentialRequest {
  subjectDid: DIDString;
  claims: Record<string, unknown>;
  type: string[];
  expiresIn?: number;
}

export interface SignedCredentialRequest extends CredentialRequest {
  issuerDid: DIDString;
  issuerPrivateKey: Uint8Array;
  issuerPublicKey: Uint8Array;
}

export interface IssuedCredential {
  credential: VerifiableCredential;
  jwt?: string;
}

export type { VerifiableCredential };

