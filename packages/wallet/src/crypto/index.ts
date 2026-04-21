import { generateKeyPair, signData, verifySignature } from '../keys/index.js';
import type { CryptoProvider } from './types.js';

export const Ed25519Provider: CryptoProvider = {
  algorithm: 'Ed25519',

  async generateKeyPair() {
    return generateKeyPair();
  },

  async sign(data: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
    return signData(data, privateKey);
  },

  async verify(
    data: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array
  ): Promise<boolean> {
    return verifySignature(data, signature, publicKey);
  },
};

/**
 * Dilithium3Provider is a placeholder for future post-quantum crypto support.
 * CRYSTALS-Dilithium (ML-DSA) will be integrated when a production-ready
 * Node.js library is available or via WASM bindings.
 */
export const Dilithium3Provider: CryptoProvider = {
  algorithm: 'Dilithium3',

  async generateKeyPair() {
    throw new Error('Dilithium3 is not yet implemented. Planned for Phase 3.');
  },

  async sign(_data: Uint8Array, _privateKey: Uint8Array): Promise<Uint8Array> {
    throw new Error('Dilithium3 is not yet implemented. Planned for Phase 3.');
  },

  async verify(
    _data: Uint8Array,
    _signature: Uint8Array,
    _publicKey: Uint8Array
  ): Promise<boolean> {
    throw new Error('Dilithium3 is not yet implemented. Planned for Phase 3.');
  },
};

export function getCryptoProvider(algorithm: 'Ed25519' | 'Dilithium3'): CryptoProvider {
  switch (algorithm) {
    case 'Ed25519':
      return Ed25519Provider;
    case 'Dilithium3':
      return Dilithium3Provider;
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}

export type { CryptoProvider, CryptoAlgorithm } from './types.js';
