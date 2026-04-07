export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '3rem',
      }}
    >
      <header style={{ textAlign: 'center', maxWidth: '720px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(129,140,248,0.1)',
            border: '1px solid rgba(129,140,248,0.3)',
            borderRadius: '9999px',
            padding: '0.25rem 1rem',
            fontSize: '0.75rem',
            color: '#818cf8',
            marginBottom: '1.5rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          <span>🔒</span>
          <span>Post-Quantum Ready · Phase 1</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #818cf8 50%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Privacy-First Identity Layer
        </h1>

        <p
          style={{
            fontSize: '1.125rem',
            color: '#94a3b8',
            lineHeight: 1.7,
            maxWidth: '560px',
            margin: '0 auto',
          }}
        >
          Decentralized, self-sovereign identity using{' '}
          <strong style={{ color: '#e2e8f0' }}>DIDs</strong> and{' '}
          <strong style={{ color: '#e2e8f0' }}>Verifiable Credentials</strong>.
          Designed for a post-quantum world — your identity, your keys, your control.
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: '800px',
        }}
      >
        {[
          {
            icon: '🔑',
            title: 'Self-Sovereign',
            desc: 'You own your keys and identity — no central authority required.',
          },
          {
            icon: '🛡️',
            title: 'Post-Quantum Ready',
            desc: 'Architecture designed for Dilithium3 and future PQC algorithms.',
          },
          {
            icon: '📜',
            title: 'Verifiable Credentials',
            desc: 'W3C-standard credentials with cryptographic proofs.',
          },
          {
            icon: '🔗',
            title: 'DID:key',
            desc: 'Ed25519-based decentralized identifiers, no blockchain needed.',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            style={{
              background: '#12121a',
              border: '1px solid #1e1e2e',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
              {feature.icon}
            </div>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#e2e8f0',
                marginBottom: '0.5rem',
              }}
            >
              {feature.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      <section
        style={{
          background: '#12121a',
          border: '1px solid #1e1e2e',
          borderRadius: '12px',
          padding: '2rem',
          width: '100%',
          maxWidth: '800px',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#e2e8f0',
            marginBottom: '1.5rem',
          }}
        >
          Roadmap
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { phase: 'Phase 1', title: 'Foundation', status: 'active', desc: 'Monorepo setup, DID generation, key management, Fastify API.' },
            { phase: 'Phase 2', title: 'Core Identity', status: 'upcoming', desc: 'VC issuance & verification, DID resolver, JWT credential flows.' },
            { phase: 'Phase 3', title: 'Post-Quantum', status: 'upcoming', desc: 'Dilithium3 integration, hybrid key schemes, migration tooling.' },
            { phase: 'Phase 4', title: 'Ecosystem', status: 'upcoming', desc: 'Wallet UI, selective disclosure, ZK proofs, mobile SDK.' },
          ].map((item) => (
            <div
              key={item.phase}
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  minWidth: '80px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: item.status === 'active' ? '#34d399' : '#475569',
                  paddingTop: '0.125rem',
                }}
              >
                {item.phase}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: item.status === 'active' ? '#e2e8f0' : '#64748b' }}>
                    {item.title}
                  </span>
                  {item.status === 'active' && (
                    <span style={{
                      fontSize: '0.6875rem',
                      background: 'rgba(52,211,153,0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(52,211,153,0.3)',
                      borderRadius: '9999px',
                      padding: '0.1rem 0.5rem',
                    }}>
                      In Progress
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          textAlign: 'center',
          color: '#475569',
          fontSize: '0.8125rem',
        }}
      >
        Myriad Identity · Phase 1 · Built with Fastify, Next.js, Ed25519 &amp; TypeScript
      </footer>
    </main>
  );
}
