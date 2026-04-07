# Myriad — Privacy-First Identity Layer (Post-Quantum Ready)

> *"L'utilisateur contrôle ses données. Le système ne fait que vérifier des preuves."*

A decentralized, self-sovereign identity platform based on open standards (W3C DIDs, Verifiable Credentials, OpenID Connect). No blockchain required.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MYRIAD IDENTITY PLATFORM                     │
│                                                                     │
│  ┌─────────────────┐    ┌──────────────────────────────────────┐   │
│  │   WALLET (FE)   │    │          BACKEND API (Fastify)        │   │
│  │  Next.js 15     │◄──►│              port 3001               │   │
│  │  port 3000      │    │                                       │   │
│  │                 │    │  ┌──────────┐  ┌────────┐  ┌──────┐  │   │
│  │  /wallet        │    │  │  /api    │  │ /api   │  │/api  │  │   │
│  │  /issue         │    │  │  /did    │  │ /vc    │  │/auth │  │   │
│  │  /verify        │    │  └────┬─────┘  └───┬────┘  └──┬───┘  │   │
│  │                 │    │       │             │           │      │   │
│  │  LocalStorage   │    └───────┼─────────────┼───────────┼──────┘  │
│  │  (credentials,  │            │             │           │         │
│  │   keys, DIDs)   │    ┌───────▼─────────────▼───────────▼──────┐  │
│  └─────────────────┘    │           PACKAGES                      │  │
│                         │  ┌──────────┐  ┌──────────────────────┐ │  │
│                         │  │  wallet  │  │  issuer  │  verifier │ │  │
│                         │  │          │  │          │            │ │  │
│                         │  │ DID:key  │  │  Sign VC │  Verify   │ │  │
│                         │  │ Ed25519  │  │  (W3C)   │  Proof    │ │  │
│                         │  │ Crypto   │  │          │            │ │  │
│                         │  │ Abstrac. │  └──────────┴────────────┘ │  │
│                         │  └──────────┘                           │  │
│                         │       shared (types)                    │  │
│                         └─────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL (metadata only)                 │   │
│  │              NO PII, NO credentials, NO keys stored          │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

| Module | Role | Stores PII? |
|--------|------|-------------|
| **Wallet** (frontend) | Generates DIDs, stores credentials in browser localStorage | Client-only |
| **Issuer Service** | Signs credentials with Ed25519, returns signed VC | ❌ Never |
| **Verifier Service** | Verifies cryptographic proofs | ❌ Never |
| **Auth Gateway** | DID challenge/response → JWT token | ❌ Never |
| **PostgreSQL** | Future: non-sensitive metadata only | ❌ Never |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Docker + Docker Compose (optional)

### Local Development

```bash
# Install all dependencies (all workspaces)
npm install

# Build all packages
npm run build

# Start all services in development mode
npm run dev
# → Frontend: http://localhost:3000
# → Backend:  http://localhost:3001
```

### Docker

```bash
# Start all services
npm run docker:up

# Stop
npm run docker:down
```

---

## 📦 Monorepo Structure

```
myriad/
├── apps/
│   ├── backend/          # Fastify API server (TypeScript)
│   └── frontend/         # Next.js 15 App Router
├── packages/
│   ├── wallet/           # DID generation, Ed25519 keys, crypto abstraction
│   ├── issuer/           # Verifiable Credential issuance + signing
│   ├── verifier/         # VC proof verification
│   └── shared/           # Shared TypeScript types
├── turbo.json            # Turborepo pipeline config
├── docker-compose.yml
└── tsconfig.base.json
```

---

## 🔑 Identity Flow

### 1. Create Identity (DID:key)
```
POST /api/did/generate
→ { did: "did:key:z6Mk...", document: {...}, publicKey: "hex", privateKey: "hex" }
```

The DID is derived deterministically from the Ed25519 public key:
`did:key:<multibase(0xed01 + publicKeyBytes)>`

No registration required. Works offline.

### 2. Issue a Credential
```
POST /api/vc/issue
Body: {
  "issuerDid": "did:key:z6MkIssuer...",
  "issuerPrivateKey": "hex...",
  "subjectDid": "did:key:z6MkSubject...",
  "type": ["EmailCredential"],
  "claims": { "email": "alice@example.com" }
}
→ W3C Verifiable Credential with Ed25519Signature2020 proof
```

### 3. Verify a Credential
```
POST /api/vc/verify
Body: { "credential": { ... } }
→ { "valid": true } or { "valid": false, "errors": ["..."] }
```

Verification checks:
- ✅ Proof signature (Ed25519)
- ✅ Issuer DID resolves correctly
- ✅ Credential not expired
- ✅ W3C context URLs present

### 4. Sign-in with Wallet (DID Auth)
```
1. POST /api/auth/challenge → { challenge: "random-hex" }
2. Sign challenge with your private key
3. POST /api/auth/verify → { did, challenge, signature }
   → { verified: true, token: "JWT..." }
```

---

## 🛡️ Security Design

| Concern | Solution |
|---------|----------|
| No server-side PII | All credentials live in browser localStorage only |
| Replay attacks | Challenges expire in 5 minutes, single-use |
| Key security | Private keys never leave the client in normal flows |
| Post-quantum prep | `CryptoProvider` abstraction — swap Ed25519 for Dilithium3 |
| Rate limiting | Auth + verify routes are rate-limited (10 req/min) |

### Crypto Abstraction (Post-Quantum Ready)

```typescript
import type { CryptoProvider } from '@myriad/wallet'

// Current: Ed25519 (production ready)
const provider: CryptoProvider = Ed25519Provider

// Future: CRYSTALS-Dilithium3 (post-quantum)
// const provider: CryptoProvider = Dilithium3Provider
```

The `CryptoProvider` interface is designed to be swapped without changing any upstream code.

---

## 🧪 API Reference

### DID Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/did/generate` | Generate new DID:key + Ed25519 keypair |
| `POST` | `/api/did/resolve` | Resolve a DID document |

### Verifiable Credential Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/vc/issue` | Issue and sign a W3C VC |
| `POST` | `/api/vc/verify` | Verify a VC proof |

### Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/challenge` | Get a sign-in challenge nonce |
| `POST` | `/api/auth/verify` | Verify signature → JWT token |

### System

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Server health check |

---

## 🧩 Standards Compliance

- **DIDs**: [W3C DID Core 1.0](https://www.w3.org/TR/did-core/) — `did:key` method
- **Verifiable Credentials**: [W3C VC Data Model 1.1](https://www.w3.org/TR/vc-data-model/)
- **Cryptographic Suites**: [Ed25519Signature2020](https://w3c-ccg.github.io/di-eddsa-2020/)
- **JWT**: [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) via `jose`
- **Future**: OpenID4VCI, OpenID4VP, SD-JWT

---

## 🔮 Roadmap

- [x] Phase 1: Monorepo, Fastify backend, Next.js frontend, Docker
- [x] Phase 2: DID:key generation, Ed25519 key management
- [x] Phase 3: W3C Verifiable Credential issuance with Ed25519 signing
- [x] Phase 4: Proof verification, DID resolution, expiry checks
- [x] Phase 5: DID challenge/response auth with JWT tokens
- [ ] SD-JWT selective disclosure
- [ ] CRYSTALS-Dilithium3 post-quantum signing
- [ ] OpenID4VCI credential issuance protocol
- [ ] OpenID4VP presentation protocol
- [ ] P2P identity exchange (libp2p)

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | TypeScript + Node.js + Fastify 5 |
| Frontend | Next.js 15 (App Router) |
| Crypto | Ed25519 via `@noble/ed25519` |
| JWT | `jose` |
| DID encoding | `multiformats` (multibase base58btc) |
| Monorepo | Turborepo + npm workspaces |
| Infrastructure | Docker + docker-compose |

---

## 📄 License

MIT