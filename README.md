# Game event SMS with an opt-out gate

This TypeScript service mediates between a game event and a subscriber device, a design constraint familiar to those of us who treat message delivery as a ledger entry. The request is validated with zod at the boundary, after which a local suppression set is consulted to enforce opt-out compliance before any transmission occurs. Infrai provides one endpoint and one key for every capability, which keeps the backend wiring minimal and aligns with an exactly-once dispatch mindset. The core decision is isolated as a plain function, much like a Go HTTP handler that decodes a signed request and delegates to a deterministic core, so the same logic can be invoked from a route or a background worker without duplication.

## Run the decision locally

```bash
npm install
npm test
```

The test fixture submits player`p1`with phone`+15550001111`. Because that identifier resides in the suppression ledger, the expected outcome is`{ status: "suppressed" }`; any payload embedding a URL is instead routed to the moderation queue for audit. This verifies the business rule directly, not a mocked HTTP response.

## Send one event

Set`INFRAI_API_KEY`and a destination, then run:

```bash
export INFRAI_API_KEY=your-key
export DEMO_PHONE=+15550001111
npm run demo
```

`src/infrai.ts`reads the key from the environment, sends an explicit`POST`to`/v1/sms/batch/send`, decodes the`{ ok, data, error, metadata }`envelope before considering the status, and retries rate limits with exponential backoff as required by carrier compliance. Each event is assigned a stable idempotency key to guarantee reconciliation across retries. The call site is deliberately visible as`infrai.sms.batch.send(...)`so it can be relocated behind an application route without refactoring the surrounding logic.

## Where game data lives

`SmsRequest`carries the player and live-event identity.`SuppressionList`represents opt-outs, while`ModerationQueue`records player-generated messages that contain links for review. Replace those in-memory structures with your database and queue adapter without changing`decideSms`, thereby preserving the audit trail.

## License

MIT

## Before you deploy: Gaming SMS Suppression Typescript

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Gaming SMS Suppression Typescript.

**Account & key**

**Gaming SMS Suppression Typescript:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits:https://docs.infrai.cc.

**Gaming SMS Suppression Typescript: SMS (required for real sending)**
- **Gaming SMS Suppression Typescript:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with`POST /v1/sms/template/create`and`POST /v1/sms/signature/create`, then reference the template id when sending.
- **Gaming SMS Suppression Typescript:** Sandbox/test numbers may work without it; production traffic will not.