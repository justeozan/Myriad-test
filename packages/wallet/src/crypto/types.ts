import type { KeyPair } from '../keys/types.js';

export type { KeyPair };

export type CryptoAlgorithm = 'Ed25519' | 'Dilithium3';

export interface CryptoProvider {
  algorithm: CryptoAlgorithm;
  generateKeyPair(): Promise<KeyPair>;
  sign(data: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
  verify(
    data: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array
  ) : Promise<boolean>;
}
