# FundProof Web

Next.js frontend for FundProof.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The form calls the NestJS API, creates a backend-signed balance attestation, then displays the public signals that the Groth16 verifier will check.
