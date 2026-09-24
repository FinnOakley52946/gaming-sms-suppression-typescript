import { sendGameSms } from "./game_sms.js";

const queue = [] as { playerId: string; eventId: string; reason: string }[];
const suppressed = new Set((process.env.SUPPRESSED_PHONES ?? "").split(",").filter(Boolean));
const result = await sendGameSms({ playerId: "player-42", phone: process.env.DEMO_PHONE ?? "+15550001111", message: "Raid starts in 10 minutes", eventId: "raid-7" }, suppressed, queue);
console.log(JSON.stringify({ result, queue }, null, 2));
