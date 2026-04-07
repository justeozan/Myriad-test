import type { VerifiableCredential, VerifiablePresentation, DIDString } from '@myriad/shared';

export interface VerificationResult {
  verified: boolean;
  error?: string;
  checks: VerificationCheck[];
}

export interface VerificationCheck {
  check: string;
  passed: boolean;
  message?: string;
}

export interface VerifierConfig {
  trustedIssuers?: DIDString[];
}

export type { VerifiableCredential, VerifiablePresentation };
