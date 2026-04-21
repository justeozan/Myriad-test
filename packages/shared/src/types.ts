export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function err<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

export interface Timestamp {
  createdAt: string;
  updatedAt: string;
}

export type DIDString = string;
export type JWTString = string;
export type Base64URLString = string;
export type HexString = string;

export interface Proof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue: string;
}

export interface VerifiableCredential {
  '@context': string[];
  id?: string;
  type: string[];
  issuer: DIDString | { id: DIDString; [key: string]: unknown };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id?: DIDString;
    [key: string]: unknown;
  };
  proof?: Proof;
}

export interface VerifiablePresentation {
  '@context': string[];
  id?: string;
  type: string[];
  holder?: DIDString;
  verifiableCredential?: VerifiableCredential[];
  proof?: Proof;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
