‎const axios = require("axios");
‎
‎module.exports.config = {
‎  name: "autoreact",
‎  version: "2026.1.0",
‎  role: 2, // ADMIN ONLY (pwede mong gawing 0 kung gusto mo public)
‎  hasPrefix: false,
‎  aliases: ["react", "auto-react"],
‎  description: "Auto React to Facebook Post",
‎  usage: "autoreact postId reaction",
‎  credits: "Startcope turbo",
‎  cooldown: 0
‎};
‎
‎/* ================= SETTINGS ================= */
‎
‎// 👉 PALITAN MO ITO
‎const COOKIE = "PASTE_YOUR_FACEBOOK_COOKIE_HERE";
‎
‎// 👉 Default reaction kung walang input
‎const DEFAULT_REACTION = "LIKE";
‎
‎// 👉 Delay bawat react (ms)
‎const REACT_DELAY = 60 * 1000; // 1 minute
‎
‎let running = false;
‎
‎/* ================= MAIN ================= */
‎
‎module.exports.run = async function ({ api, event, args }) {
‎  const threadID = event.threadID;
‎
‎  if (running) {
‎    return api.sendMessage("⚠️ Auto React is already running.", threadID);
‎  }
‎
‎  const postId = args[0];
‎  const reaction = (args[1] || DEFAULT_REACTION).toUpperCase();
‎
‎  if (!postId) {
‎    return api.sendMessage(
‎`❌ Kulang ang impormasyon.
‎
‎Example:
‎autoreact 1234567890 LOVE
‎
‎Reactions:
‎LIKE | LOVE | WOW | HAHA | SAD | ANGRY`,
‎      threadID
‎    );
‎  }
‎
‎  running = true;
‎
‎  api.sendMessage(
‎`🤖 AUTO REACT STARTED
‎━━━━━━━━━━━━━━━━━━
‎📌 Post ID: ${postId}
‎❤️ Reaction: ${reaction}
‎⏱ Interval: ${REACT_DELAY / 1000}s`,
‎    threadID
‎  );
‎
‎  const reactLoop = async () => {
‎    if (!running) return;
‎
‎    try {
‎      await axios.get(
‎        "https://vern-rest-api.vercel.app/api/autoreact",
‎        {
‎          params: {
‎            cookie: COOKIE,
‎            postId,
‎            reaction
‎          },
‎          timeout: 15000
‎        }
‎      );
‎
‎      console.log(`[AUTO-REACT] Reacted: ${reaction} → ${postId}`);
‎
‎    } catch (err) {
‎      console.error("[AUTO-REACT ERROR]", err.message);
‎    }
‎
‎    setTimeout(reactLoop, REACT_DELAY);
‎  };
‎
‎  reactLoop();
‎};
‎
‎/* ================= STOP COMMAND ================= */
‎
‎module.exports.stop = function ({ api, event }) {
‎  running = false;
‎  api.sendMessage("🛑 Auto React stopped.", event.threadID);
‎};
‎
