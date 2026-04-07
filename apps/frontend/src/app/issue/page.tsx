'use client';

import { useState } from 'react';
import { WalletProvider, useWallet } from '../wallet/components/WalletContext';

const API = 'http://localhost:3001';

function IssueContent() {
  const { did, addCredential } = useWallet();
  const [subjectDid, setSubjectDid] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const issue = async () => {
    if (!did) { setError('No issuer DID found. Please generate one in the Wallet.'); return; }
    if (!subjectDid) { setError('Subject DID is required'); return; }
    setIssuing(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API}/api/vc/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issuerDid: did.did,
          issuerPrivateKey: did.privateKey,
          subjectDid,
          type: ['EmailCredential'],
          claims: { email, ...(name && { name }) },
          expiresIn: 365 * 24 * 60 * 60,
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { message?: string; error?: string };
        throw new Error(err.message ?? err.error ?? `HTTP ${res.status}`);
      }
      const credential = await res.json() as Record<string, unknown>;
      setResult(credential);
      addCredential(credential);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to issue credential');
    } finally {
      setIssuing(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0f0f17', border: '1px solid #1e1e2e',
    borderRadius: '8px', padding: '0.75rem', fontSize: '0.9375rem',
    color: '#e2e8f0', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/wallet" style={{ fontSize: '0.875rem', color: '#818cf8', textDecoration: 'none' }}>← Wallet</a>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', marginTop: '0.5rem' }}>
          📜 Issue Credential
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem', marginTop: '0.5rem' }}>
          Issue a signed Verifiable Credential from your DID.
        </p>
      </div>

      {!did && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem',
          fontSize: '0.875rem', color: '#f87171',
        }}>
          ⚠️ No issuer DID found. <a href="/wallet" style={{ color: '#818cf8' }}>Generate one first</a>.
        </div>
      )}

      <div style={{
        background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '2rem',
      }}>
        {did && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              ISSUER DID
            </label>
            <code style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {did.did}
            </code>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              SUBJECT DID *
            </label>
            <input
              style={inputStyle}
              value={subjectDid}
              onChange={(e) => setSubjectDid(e.target.value)}
              placeholder="did:key:z6Mk…"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              EMAIL CLAIM
            </label>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@example.com"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              NAME CLAIM (optional)
            </label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alice"
            />
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '1rem', color: '#f87171', fontSize: '0.875rem' }}>{error}</div>
        )}

        <button
          onClick={issue}
          disabled={issuing || !did}
          style={{
            marginTop: '1.5rem',
            background: did ? 'linear-gradient(135deg, #818cf8, #34d399)' : '#1e1e2e',
            border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem',
            fontSize: '1rem', fontWeight: 600,
            color: did ? '#0f0f17' : '#475569',
            cursor: issuing || !did ? 'not-allowed' : 'pointer',
            opacity: issuing ? 0.7 : 1, width: '100%',
          }}
        >
          {issuing ? 'Issuing…' : '✨ Issue Credential'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
            borderRadius: '8px', padding: '1rem', marginBottom: '1rem',
            fontSize: '0.875rem', color: '#34d399',
          }}>
            ✓ Credential issued and saved to wallet!
          </div>
          <div style={{
            background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '1.5rem',
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#818cf8', marginBottom: '0.75rem' }}>
              Credential JSON
            </h3>
            <pre style={{
              fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace',
              overflow: 'auto', maxHeight: '400px', lineHeight: 1.6,
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}

export default function IssuePage() {
  return (
    <WalletProvider>
      <IssueContent />
    </WalletProvider>
  );
}
