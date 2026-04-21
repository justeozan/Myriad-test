'use client';

import { useState } from 'react';
import { WalletProvider, useWallet } from './components/WalletContext';
import { DIDCard } from './components/DIDCard';
import { CredentialCard } from './components/CredentialCard';

const API = 'http://localhost:3001';

function WalletContent() {
  const { did, credentials, setDID, removeCredential, clearWallet } = useWallet();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [authStatus, setAuthStatus] = useState('');

  const generateDID = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/did/generate`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { did: string; publicKey: string; privateKey: string };
      setDID({ did: data.did, publicKey: data.publicKey, privateKey: data.privateKey });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate DID');
    } finally {
      setGenerating(false);
    }
  };

  const signInDemo = async () => {
    if (!did) { setAuthStatus('Generate a DID first'); return; }
    setAuthStatus('Requesting challenge…');
    try {
      const chalRes = await fetch(`${API}/api/auth/challenge`, { method: 'POST' });
      const { challenge } = await chalRes.json() as { challenge: string };
      setAuthStatus(`Challenge: ${challenge.slice(0, 16)}… — signing not available in browser demo`);
    } catch {
      setAuthStatus('Error connecting to backend');
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <a href="/" style={{ fontSize: '0.875rem', color: '#818cf8', textDecoration: 'none' }}>← Home</a>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', marginTop: '0.5rem' }}>
            🔑 Identity Wallet
          </h1>
        </div>
        {did && (
          <button onClick={clearWallet} style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem',
            color: '#f87171', cursor: 'pointer',
          }}>
            Clear Wallet
          </button>
        )}
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>
          DID Manager
        </h2>
        {!did ? (
          <div style={{
            background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px',
            padding: '2rem', textAlign: 'center',
          }}>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              No identity found. Generate your decentralized identifier.
            </p>
            <button
              onClick={generateDID}
              disabled={generating}
              style={{
                background: 'linear-gradient(135deg, #818cf8, #34d399)',
                border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem',
                fontSize: '1rem', fontWeight: 600, color: '#0f0f17',
                cursor: generating ? 'not-allowed' : 'pointer',
                opacity: generating ? 0.7 : 1,
              }}
            >
              {generating ? 'Generating…' : '✨ Generate New Identity'}
            </button>
            {error && <p style={{ color: '#f87171', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</p>}
          </div>
        ) : (
          <div>
            <DIDCard did={did.did} publicKey={did.publicKey} />
            <button
              onClick={generateDID}
              disabled={generating}
              style={{
                marginTop: '0.75rem',
                background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.3)',
                borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem',
                color: '#818cf8', cursor: 'pointer',
              }}
            >
              {generating ? 'Generating…' : 'Regenerate Identity'}
            </button>
          </div>
        )}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#e2e8f0' }}>
            Credentials ({credentials.length})
          </h2>
          <a href="/issue" style={{
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
            borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.875rem',
            color: '#34d399', textDecoration: 'none',
          }}>
            + Issue Credential
          </a>
        </div>
        {credentials.length === 0 ? (
          <div style={{
            background: '#12121a', border: '1px dashed #1e1e2e', borderRadius: '12px',
            padding: '2rem', textAlign: 'center', color: '#475569',
          }}>
            No credentials yet. Issue a credential to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {credentials.map((c) => (
              <CredentialCard
                key={c.id}
                credential={c.credential}
                storedAt={c.storedAt}
                onRemove={() => removeCredential(c.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>
          Sign In with Wallet
        </h2>
        <div style={{
          background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '1.5rem',
        }}>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Demonstrate DID-based authentication by signing a server challenge with your private key.
          </p>
          <button
            onClick={signInDemo}
            style={{
              background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.3)',
              borderRadius: '8px', padding: '0.75rem 1.5rem', fontSize: '0.875rem',
              color: '#818cf8', cursor: 'pointer',
            }}
          >
            🔐 Sign In with DID
          </button>
          {authStatus && (
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#94a3b8', fontFamily: 'monospace' }}>
              {authStatus}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default function WalletPage() {
  return (
    <WalletProvider>
      <WalletContent />
    </WalletProvider>
  );
}
