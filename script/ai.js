const axios = require("axios");
const fs = require("fs");

/* ================= ADMIN ================= */
const ADMIN_ID = "61552057602849";

/* ================= OWNER INFO ================= */
const OWNER_INFO = {
  name: "Jero",
  bot: "Jero.Ai.2.0",
  facebook: "https://www.facebook.com/Jay.bohol.d",
  phone: "099916527333",
  gmail: "jaydbohol.help.org@gmail.com"
};

/* ================= MEMORY ================= */
const MEMORY_FILE = "./aiStudentMemory.json";
let memory = fs.existsSync(MEMORY_FILE)
  ? JSON.parse(fs.readFileSync(MEMORY_FILE))
  : {};

function saveMemory() {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

/* ================= CONFIG ================= */
module.exports.config = {
  name: "ai",
  version: "Jero.Ai.2.0",
  role: 0,
  hasPrefix: false,
  aliases: ["gpt", "jero", "jeroai"],
  description: "Jero.Ai.2.0 – Smart Messenger Assistant",
  usage: "ai [question]",
  credits: "Jerobie",
  cooldown: 0
};

/* ================= HELPERS ================= */
const isFilipino = (t) =>
  /(ano|paano|bakit|sino|saan|info|tungkol)/i.test(t);

function getMode(text) {
  if (/timer/i.test(text)) return "TIMER";
  if (/essay|sanaysay/i.test(text)) return "ESSAY";
  if (/solve|kwentahin|compute|math/i.test(text)) return "MATH";
  if (/exam|review/i.test(text)) return "REVIEW";
  return "GENERAL";
}

/* ================= MAIN ================= */
module.exports.run = async function ({ api, event, args }) {
  const input = args.join(" ").trim();
  const uid = event.senderID;
  const threadID = event.threadID;

  if (!input) {
    return api.sendMessage(
`🤖 Jero.Ai.2.0

Ask me anything 👇
• General questions
• Math / Homework
• Essay / Explanation
• Tech / Coding
• Timer (ex: timer 10)
• Owner info

Just type your question.`,
      threadID
    );
  }

  /* ---------- OWNER INFO ---------- */
  if (/ai info|owner info|who made you|about you|developer info/i.test(input)) {
    return api.sendMessage(
`🤖 ${OWNER_INFO.bot} — OWNER INFO
━━━━━━━━━━━━━━━━━━
👤 Owner: ${OWNER_INFO.name}

🔵 Facebook:
${OWNER_INFO.facebook}

📞 Contact Number:
${OWNER_INFO.phone}

📧 Gmail:
${OWNER_INFO.gmail}

━━━━━━━━━━━━━━━━━━
Credits: Jerobie`,
      threadID
    );
  }

  /* ---------- ADMIN ---------- */
  if (/reset memory/i.test(input) && uid === ADMIN_ID) {
    memory = {};
    saveMemory();
    return api.sendMessage("✅ Memory reset successful.", threadID);
  }

  if (/view stats/i.test(input) && uid === ADMIN_ID) {
    return api.sendMessage(
      `📊 ADMIN DASHBOARD\n\nTotal Users: ${Object.keys(memory).length}`,
      threadID
    );
  }

  const mode = getMode(input);
  const filipino = isFilipino(input);

  /* ---------- TIMER ---------- */
  if (mode === "TIMER") {
    const mins = parseInt(input.match(/\d+/)?.[0]);
    if (!mins) {
      return api.sendMessage("❌ Please specify minutes.", threadID);
    }

    api.sendMessage(`⏱️ Timer started: ${mins} minutes`, threadID);
    setTimeout(() => {
      api.sendMessage("⏰ Time's up!", threadID);
    }, mins * 60000);
    return;
  }

  /* ---------- MEMORY ---------- */
  memory[uid] = memory[uid] || { chats: 0 };
  memory[uid].chats++;
  saveMemory();

  /* ---------- AI PROMPT ---------- */
  const systemPrompt = `
You are Jero.Ai.2.0, a smart and friendly Messenger AI.

MODE: ${mode}

RULES:
- Answer ANY type of question
- Be clear, helpful, and respectful
- Step-by-step for math or coding
- Casual tone if casual, professional if serious
- Use Filipino if the user uses Filipino
- Safe and accurate responses
`;

  api.sendMessage("🤖 Jero.Ai.2.0 is thinking...", threadID, async (_, info) => {
    try {
      const { data } = await axios.get(
        "https://urangkapolka.vercel.app/api/chatgpt4",
        {
          params: {
            prompt: `${systemPrompt}\n\nUSER:\n${input}`
          },
          timeout: 30000
        }
      );

      const answer =
        data?.response ||
        data?.answer ||
        "I couldn't generate a response right now.";

      api.editMessage(
`🤖 Jero.Ai.2.0
━━━━━━━━━━━━━━━━━━
🧠 Mode: ${mode}

${answer}

━━━━━━━━━━━━━━━━━━
© Jerobie`,
        info.messageID
      );
    } catch (e) {
      api.editMessage(
        filipino
          ? "❌ May problema ngayon, subukan ulit mamaya."
          : "❌ Something went wrong. Please try again later.",
        info.messageID
      );
    }
  });
};
