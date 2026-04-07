import { resolveDID } from '@myriad/wallet';
import type {
  VerificationResult,
  VerificationCheck,
  VerifierConfig,
  VerifiableCredential,
  VerifiablePresentation,
} from './types.js';

export class Verifier {
  private config: VerifierConfig;

  constructor(config: VerifierConfig = {}) {
    this.config = config;
  }

  async verifyCredential(credential: VerifiableCredential): Promise<VerificationResult> {
    const checks: VerificationCheck[] = [];

    // Check required fields
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

    // Check expiry
    const notExpired = !credential.expirationDate ||
      new Date(credential.expirationDate) > new Date();
    checks.push({
      check: 'expiry',
      passed: notExpired,
      message: notExpired ? 'Not expired' : 'Credential has expired',
    });

    // Check trusted issuers if configured
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

    // Resolve issuer DID
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

    const verified = checks.every((c) => c.passed);
    return { verified, checks };
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
