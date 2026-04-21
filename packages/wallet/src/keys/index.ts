import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import type { KeyPair } from './types.js';

// noble/ed25519 v2 requires setting sha512 sync
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export async function generateKeyPair(): Promise<KeyPair> {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  return {
    publicKey,
    privateKey,
    algorithm: 'Ed25519',
  };
}

export async function signData(
  data: Uint8Array,
  privateKey: Uint8Array
): Promise<Uint8Array> {
  return ed.signAsync(data, privateKey);
}

export async function verifySignature(
  data: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  try {
    return await ed.verifyAsync(signature, data, publicKey);
  } catch {
    return false;
  }
}

export type { KeyPair, SerializedKeyPair } from './types.js';
