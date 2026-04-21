import { resolveDID, verifySignature } from '@myriad/wallet';
import { base58btc } from 'multiformats/bases/base58';
import type {
  VerificationResult,
  VerificationCheck,
  VerifierConfig,
  VerifiableCredential,
  VerifiablePresentation,
} from './types.js';
import type { VerificationMethod } from '@myriad/wallet';

export class Verifier {
  private config: VerifierConfig;

  constructor(config: VerifierConfig = {}) {
    this.config = config;
  }

  async verifyCredential(credential: VerifiableCredential): Promise<VerificationResult> {
    const checks: VerificationCheck[] = [];

    const hasContext = Array.isArray(credential['@context']) &&
      credential['@context'].some((ctx) => ctx === 'https://www.w3.org/2018/credentials/v1');
    checks.push({
      check: 'context',
      passed: hasContext,
      message: hasContext ? 'Valid @context' : 'Missing or invalid @context',
    });

    const hasType = Array.isArray(credential.type) &&
      credential.type.includes('VerifiableCredential');
    checks.push({
      check: 'type',
      passed: hasType,
      message: hasType ? 'Valid type' : 'Missing VerifiableCredential type',
    });

    const hasIssuer = Boolean(credential.issuer);
    checks.push({
      check: 'issuer',
      passed: hasIssuer,
      message: hasIssuer ? 'Issuer present' : 'Missing issuer',
    });

    const notExpired = !credential.expirationDate ||
      new Date(credential.expirationDate) > new Date();
    checks.push({
      check: 'expiry',
      passed: notExpired,
      message: notExpired ? 'Not expired' : 'Credential has expired',
    });

    if (this.config.trustedIssuers && this.config.trustedIssuers.length > 0) {
      const issuerDid = typeof credential.issuer === 'string'
        ? credential.issuer
        : credential.issuer.id;
      const isTrusted = this.config.trustedIssuers.includes(issuerDid);
      checks.push({
        check: 'trustedIssuer',
        passed: isTrusted,
        message: isTrusted ? 'Issuer is trusted' : `Issuer ${issuerDid} is not in trusted list`,
      });
    }

    const issuerDid = typeof credential.issuer === 'string'
      ? credential.issuer
      : credential.issuer.id;
    const resolution = await resolveDID(issuerDid);
    const didResolved = resolution.didDocument !== null;
    checks.push({
      check: 'issuerDIDResolution',
      passed: didResolved,
      message: didResolved ? 'Issuer DID resolved' : `Failed to resolve issuer DID: ${resolution.didResolutionMetadata.error}`,
    });

    if (credential.proof && resolution.didDocument) {
      const proofCheck = await this.verifyProof(credential, resolution.didDocument.verificationMethod);
      checks.push(proofCheck);
    } else if (!credential.proof) {
      checks.push({
        check: 'proof',
        passed: false,
        message: 'No proof found in credential',
      });
    }

    const verified = checks.every((c) => c.passed);
    return { verified, checks };
  }

  private async verifyProof(
    credential: VerifiableCredential,
    verificationMethods: VerificationMethod[]
  ): Promise<VerificationCheck> {
    const proof = credential.proof;
    if (!proof) {
      return { check: 'proof', passed: false, message: 'No proof' };
    }

    try {
      const vm = verificationMethods.find(
        (m) => m.id === proof.verificationMethod
      ) ?? verificationMethods[0];

      if (!vm?.publicKeyMultibase) {
        return { check: 'proof', passed: false, message: 'No publicKeyMultibase in verification method' };
      }

      const decoded = base58btc.decode(vm.publicKeyMultibase);
      const publicKeyBytes = decoded.slice(2);

      const { proof: _proof, ...credentialBody } = credential;
      const sortedKeys = Object.keys(credentialBody).sort() as (keyof typeof credentialBody)[];
      const canonical: Record<string, unknown> = {};
      for (const key of sortedKeys) {
        canonical[key] = credentialBody[key as keyof typeof credentialBody];
      }

      const encoded = new TextEncoder().encode(JSON.stringify(canonical));
      const signatureBytes = Buffer.from(proof.proofValue, 'base64url');

      const valid = await verifySignature(encoded, signatureBytes, publicKeyBytes);
      return {
        check: 'proof',
        passed: valid,
        message: valid ? 'Signature verified' : 'Signature verification failed',
      };
    } catch (error) {
      return {
        check: 'proof',
        passed: false,
        message: `Proof verification error: ${error instanceof Error ? error.message : 'unknown'}`,
      };
    }
  }

  async verifyPresentation(presentation: VerifiablePresentation): Promise<VerificationResult> {
    const checks: VerificationCheck[] = [];

    const hasContext = Array.isArray(presentation['@context']) &&
      presentation['@context'].some((ctx) => ctx === 'https://www.w3.org/2018/credentials/v1');
    checks.push({
      check: 'context',
      passed: hasContext,
      message: hasContext ? 'Valid @context' : 'Missing or invalid @context',
    });

    const hasType = Array.isArray(presentation.type) &&
      presentation.type.includes('VerifiablePresentation');
    checks.push({
      check: 'type',
      passed: hasType,
      message: hasType ? 'Valid type' : 'Missing VerifiablePresentation type',
    });

    const credentialResults: VerificationResult[] = [];
    if (presentation.verifiableCredential) {
      for (const vc of presentation.verifiableCredential) {
        const result = await this.verifyCredential(vc);
        credentialResults.push(result);
      }
    }

    const allCredentialsValid = credentialResults.every((r) => r.verified);
    checks.push({
      check: 'credentials',
      passed: allCredentialsValid,
      message: allCredentialsValid
        ? 'All credentials are valid'
        : 'One or more credentials failed verification',
    });

    const verified = checks.every((c) => c.passed);
    return { verified, checks };
  }
}

export type { VerificationResult, VerificationCheck, VerifierConfig } from './types.js';
