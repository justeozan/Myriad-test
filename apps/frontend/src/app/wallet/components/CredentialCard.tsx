'use client';

interface CredentialCardProps {
  credential: Record<string, unknown>;
  storedAt: string;
  onRemove: () => void;
}

export function CredentialCard({ credential, storedAt, onRemove }: CredentialCardProps) {
  const type = Array.isArray(credential.type)
    ? (credential.type as string[]).filter((t) => t !== 'VerifiableCredential').join(', ')
    : 'Unknown';

  const issuer = typeof credential.issuer === 'string'
    ? credential.issuer
    : (credential.issuer as { id: string } | undefined)?.id ?? 'Unknown';

  const subject = credential.credentialSubject as Record<string, unknown> | undefined;
  const subjectId = typeof subject?.id === 'string' ? subject.id : '';
  const claims = subject ? Object.entries(subject).filter(([k]) => k !== 'id') : [];
  const hasProof = Boolean(credential.proof);

  return (
    <div style={{
      background: '#12121a',
      border: '1px solid #1e1e2e',
      borderRadius: '12px',
      padding: '1.5rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {type || 'Verifiable Credential'}
          </span>
          {hasProof && (
            <span style={{
              marginLeft: '0.5rem',
              fontSize: '0.6875rem',
              background: 'rgba(52,211,153,0.15)',
              color: '#34d399',
              border: '1px solid rgba(52,211,153,0.3)',
              borderRadius: '9999px',
              padding: '0.1rem 0.5rem',
            }}>
              ✓ Signed
            </span>
          )}
        </div>
        <button
          onClick={onRemove}
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '6px',
            padding: '0.2rem 0.6rem',
            fontSize: '0.75rem',
            color: '#f87171',
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      </div>

      {subjectId && (
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Subject: </span>
          <code style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {subjectId.length > 60 ? `${subjectId.slice(0, 60)}…` : subjectId}
          </code>
        </div>
      )}

      {claims.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          {claims.map(([key, value]) => (
            <div key={key} style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              <span style={{ color: '#64748b' }}>{key}: </span>
              <span style={{ color: '#e2e8f0' }}>{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.6875rem', color: '#475569' }}>
          Issuer: {issuer.length > 40 ? `${issuer.slice(0, 40)}…` : issuer}
        </span>
        <span style={{ fontSize: '0.6875rem', color: '#475569' }}>
          Stored {new Date(storedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
