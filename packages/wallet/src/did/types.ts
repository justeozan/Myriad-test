export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase?: string;
  publicKeyJwk?: Record<string, string>;
}

export interface DIDDocument {
  '@context': string[];
  id: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  keyAgreement?: string[];
  capabilityInvocation?: string[];
  capabilityDelegation?: string[];
}

export interface DIDResolutionResult {
  didDocument: DIDDocument | null;
  didResolutionMetadata: {
    error?: string;
    contentType?: string;
  };
  didDocumentMetadata: Record<string, unknown>;
}
