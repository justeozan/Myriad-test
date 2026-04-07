import { base58btc } from 'multiformats/bases/base58';
import { generateKeyPair } from '../keys/index.js';
import type { DIDDocument, DIDResolutionResult, VerificationMethod } from './types.js';

// Multicodec prefix for Ed25519 public key: 0xed01
const ED25519_MULTICODEC_PREFIX = new Uint8Array([0xed, 0x01]);

function publicKeyToMultibase(publicKey: Uint8Array): string {
  const prefixed = new Uint8Array(ED25519_MULTICODEC_PREFIX.length + publicKey.length);
  prefixed.set(ED25519_MULTICODEC_PREFIX);
  prefixed.set(publicKey, ED25519_MULTICODEC_PREFIX.length);
  return base58btc.encode(prefixed);
}

function multibaseToPublicKey(multibase: string): Uint8Array {
  const decoded = base58btc.decode(multibase);
  // Verify multicodec prefix
  if (decoded[0] !== 0xed || decoded[1] !== 0x01) {
    throw new Error('Invalid Ed25519 multibase key: incorrect multicodec prefix');
  }
  return decoded.slice(2);
}

function buildDIDDocument(did: string, publicKeyMultibase: string): DIDDocument {
  const keyId = `${did}#${publicKeyMultibase}`;
  const verificationMethod: VerificationMethod = {
    id: keyId,
    type: 'Ed25519VerificationKey2020',
    controller: did,
    publicKeyMultibase,
  };

  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
    ],
    id: did,
    verificationMethod: [verificationMethod],
    authentication: [keyId],
    assertionMethod: [keyId],
    capabilityInvocation: [keyId],
    capabilityDelegation: [keyId],
  };
}

export interface GeneratedDID {
  did: string;
  document: DIDDocument;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export async function generateDID(): Promise<GeneratedDID> {
  const keyPair = await generateKeyPair();
  const publicKeyMultibase = publicKeyToMultibase(keyPair.publicKey);
  const did = `did:key:${publicKeyMultibase}`;
  const document = buildDIDDocument(did, publicKeyMultibase);

  return {
    did,
    document,
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

export async function resolveDID(did: string): Promise<DIDResolutionResult> {
  if (!did.startsWith('did:key:')) {
    return {
      didDocument: null,
      didResolutionMetadata: { error: 'methodNotSupported' },
      didDocumentMetadata: {},
    };
  }

  const [, , publicKeyMultibase] = did.split(':');

  if (!publicKeyMultibase) {
    return {
      didDocument: null,
      didResolutionMetadata: { error: 'invalidDid' },
      didDocumentMetadata: {},
    };
  }

  try {
    multibaseToPublicKey(publicKeyMultibase);
    const document = buildDIDDocument(did, publicKeyMultibase);

    return {
      didDocument: document,
      didResolutionMetadata: { contentType: 'application/did+ld+json' },
      didDocumentMetadata: { created: new Date().toISOString() },
    };
  } catch (error) {
    return {
      didDocument: null,
      didResolutionMetadata: {
        error: 'invalidDid',
      },
      didDocumentMetadata: {},
    };
  }
}

export type { DIDDocument, DIDResolutionResult, VerificationMethod } from './types.js';
