import { z } from "zod";
import { infrai } from "./infrai.js";

export const smsRequest = z.object({
  playerId: z.string().min(1),
  phone: z.string().min(7),
  message: z.string().min(1),
  eventId: z.string().min(1),
});

export type SmsRequest = z.infer<typeof smsRequest>;
export type ModerationQueue = { playerId: string; eventId: string; reason: string }[];
export type SuppressionList = Set<string>;

export function decideSms(input: SmsRequest, suppressed: SuppressionList, queue: ModerationQueue) {
  const parsed = smsRequest.parse(input);
  if (suppressed.has(parsed.phone)) return { status: "suppressed" as const, reason: "player opted out" };
  if (parsed.message.includes("http://") || parsed.message.includes("https://")) {
    queue.push({ playerId: parsed.playerId, eventId: parsed.eventId, reason: "link requires moderation" });
    return { status: "queued" as const, reason: "moderation review" };
  }
  return { status: "send" as const, payload: { to: parsed.phone, body: parsed.message } };
}

export async function sendGameSms(input: unknown, suppressed: SuppressionList, queue: ModerationQueue) {
  const decision = decideSms(input as SmsRequest, suppressed, queue);
  if (decision.status !== "send") return decision;
  const parsed = smsRequest.parse(input);
  const data = await infrai.sms.batch.send({ messages: [decision.payload] }, `game-event-${parsed.eventId}-${parsed.playerId}`);
  return { status: "sent" as const, data };
}
