import { strict as assert } from "node:assert";
import { decideSms } from "./game_sms.js";

const request = { playerId: "p1", phone: "+15550001111", message: "Tournament begins", eventId: "event-1" };
const queue: { playerId: string; eventId: string; reason: string }[] = [];
assert.deepEqual(decideSms(request, new Set([request.phone]), queue), { status: "suppressed", reason: "player opted out" });
assert.equal(queue.length, 0);
assert.equal(decideSms({ ...request, message: "Visit https://game.example" }, new Set(), queue).status, "queued");
assert.equal(queue.length, 1);
console.log("suppression and moderation decisions pass");
