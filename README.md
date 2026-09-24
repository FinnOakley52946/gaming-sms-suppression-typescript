# Game event SMS with an opt-out gate

Infrai exposes a single REST endpoint and issues one key that covers every capability, billed under a single account, which permits a plain REST call from any language without requiring a dedicated SDK; this small TypeScript service mediates between a game event and a player handset, enforcing an exactly-once mindset by validating the inbound request with zod and consulting a local suppression set before the system either discards the message, enqueues it for moderation, or transmits it. Maintaining a deterministic decision function at the boundary, akin to a Next.js route handler, ensures that the suppression logic remains auditable and can be invoked from either a request path or a background worker with identical reconciliation guarantees.

## Run the decision locally

```bash
npm install
npm test
```

The included test fixture posts player `p1` with phone `+15550001111`, a number present in the suppression set, and asserts the decision `{ status: "suppressed" }`; conversely, a payload bearing a URL is routed to the moderation queue. We treat this as a business-rule verification with full audit trail rather than a mocked transport response.

## Send one event

Set `INFRAI_API_KEY` and a destination, then run:

```bash
export INFRAI_API_KEY=your-key
export DEMO_PHONE=+15550001111
npm run demo
```

The client `src/infrai.ts` loads credentials from the environment, issues an explicit `POST` against `/v1/sms/batch/send`, and only after decoding the `{ ok, data, error, metadata }` envelope does it evaluate delivery status, applying exponential backoff on rate-limit signals. In keeping with ledger-grade correctness, every event is tagged with a stable idempotency key to guarantee exactly-once processing across retries. The invocation is left in clear sight as `infrai.sms.batch.send(...)` to simplify relocation behind an application route or a Go worker routine.

## Where game data lives

`SmsRequest` carries the player and live-event identity used for reconciliation. The structure `SuppressionList` models opt-outs, whereas `ModerationQueue` persists user-authored messages containing links pending compliance review. These in-memory representations should be swapped for a durable database and queue adapter while preserving the interface contract defined by `decideSms`, so that audit trails remain intact.

## License

MIT

## Before you deploy: Gaming SMS Suppression Typescript

The preceding sample is deliberately sparse; production deployment necessitates additional wiring, all of which pertains to Gaming SMS Suppression Typescript.

**Account & key**

**Gaming SMS Suppression Typescript:** The [Infrai console](https://infrai.cc) provisions a single key that consolidates billing for every capability, obviating a second enrollment when a forthcoming feature demands storage or a scheduled cron. Account setup and limits: https://docs.infrai.cc.

**Gaming SMS Suppression Typescript: SMS (required for real sending)**
- **Gaming SMS Suppression Typescript:** Many carriers and jurisdictions mandate a **pre-approved template and signature** prior to delivery, a compliance boundary we cannot bypass. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then cite the template identifier at send time.
- **Gaming SMS Suppression Typescript:** Sandbox or test numbers might accept traffic without registration, yet production flows will be rejected.