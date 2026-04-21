'use client';

import { useState } from 'react';

const API = 'http://localhost:3001';

interface VerifyResponse {
  valid: boolean;
  errors?: string[];
}

export default function VerifyPage() {
  const [credentialJson, setCredentialJson] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [parseError, setParseError] = useState('');

  const verify = async () => {
    setParseError('');
    setResult(null);
    let credential: unknown;
    try {
      credential = JSON.parse(credentialJson) as unknown;
    } catch {
      setParseError('Invalid JSON — please paste a valid credential');
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch(`${API}/api/vc/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json() as VerifyResponse;
      setResult(data);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Failed to connect to backend');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/" style={{ fontSize: '0.875rem', color: '#818cf8', textDecoration: 'none' }}>← Home</a>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', marginTop: '0.5rem' }}>
          🔍 Verify Credential
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem', marginTop: '0.5rem' }}>
          Paste a Verifiable Credential JSON to verify its cryptographic proof.
        </p>
      </div>

      <div style={{
        background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '2rem',
      }}>
        <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
          CREDENTIAL JSON
        </label>
        <textarea
          value={credentialJson}
          onChange={(e) => setCredentialJson(e.target.value)}
          placeholder={'{\n  "@context": [...],\n  "type": ["VerifiableCredential", ...],\n  ...\n}'}
          style={{
            width: '100%', minHeight: '240px', background: '#0f0f17',
            border: '1px solid #1e1e2e', borderRadius: '8px', padding: '0.75rem',
            fontSize: '0.8125rem', color: '#e2e8f0', fontFamily: 'monospace',
            lineHeight: 1.6, boxSizing: 'border-box', resize: 'vertical',
          }}
        />
        {parseError && (
          <p style={{ marginTop: '0.5rem', color: '#f87171', fontSize: '0.875rem' }}>{parseError}</p>
        )}
        <button
          onClick={verify}
          disabled={verifying || !credentialJson.trim()}
          style={{
            marginTop: '1rem',
            background: credentialJson.trim() ? 'linear-gradient(135deg, #818cf8, #34d399)' : '#1e1e2e',
            border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem',
            fontSize: '1rem', fontWeight: 600,
            color: credentialJson.trim() ? '#0f0f17' : '#475569',
            cursor: verifying || !credentialJson.trim() ? 'not-allowed' : 'pointer',
            opacity: verifying ? 0.7 : 1, width: '100%',
          }}
        >
          {verifying ? 'Verifying…' : '🔍 Verify Credential'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{
            background: result.valid ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${result.valid ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: '12px', padding: '1.5rem',
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: result.valid ? '#34d399' : '#f87171', marginBottom: '0.75rem' }}>
              {result.valid ? '✓ Valid Credential' : '✗ Invalid Credential'}
            </div>
            {result.errors && result.errors.length > 0 && (
              <ul style={{ margin: 0, padding: '0 0 0 1rem' }}>
                {result.errors.map((e, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: '#f87171', marginBottom: '0.25rem' }}>
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
