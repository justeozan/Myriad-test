export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  algorithm: 'Ed25519' | 'Dilithium3';
}

export interface SerializedKeyPair {
  publicKey: string;
  privateKey: string;
  algorithm: 'Ed25519' | 'Dilithium3';
}
