'use client';

import { useState } from 'react';

interface DIDCardProps {
  did: string;
  publicKey?: string;
}

export function DIDCard({ did, publicKey }: DIDCardProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(did);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: '#12121a',
      border: '1px solid #1e1e2e',
      borderRadius: '12px',
      padding: '1.5rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Your DID
        </span>
        <button
          onClick={copy}
          style={{
            background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(129,140,248,0.1)',
            border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(129,140,248,0.3)'}`,
            borderRadius: '6px',
            padding: '0.25rem 0.75rem',
            fontSize: '0.75rem',
            color: copied ? '#34d399' : '#818cf8',
            cursor: 'pointer',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <code style={{
        display: 'block',
        wordBreak: 'break-all',
        fontSize: '0.8125rem',
        color: '#e2e8f0',
        fontFamily: 'monospace',
        lineHeight: 1.6,
      }}>
        {did}
      </code>
      {publicKey && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #1e1e2e' }}>
          <span style={{ fontSize: '0.6875rem', color: '#475569' }}>Public Key (hex, first 16 bytes): </span>
          <code style={{ fontSize: '0.6875rem', color: '#64748b', fontFamily: 'monospace' }}>
            {publicKey.slice(0, 32)}…
          </code>
        </div>
      )}
    </div>
  );
}
