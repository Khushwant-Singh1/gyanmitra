console.log("🟢 index.ts file loaded");

import dotenv from "dotenv";
dotenv.config();

console.log("🟢 dotenv loaded");

import { app } from "./app";
console.log("🟢 app imported");

import { initializeDB } from "./db/index.db";
import { initMinio } from "./utils/minioClient";
console.log("🟢 initializeDB imported");

import { initScheduler } from "./services/scheduler.services";

const PORT = Number(process.env.PORT) || 8000;

(async () => {
  try {
    console.log("➡️ Before initializeDB");
    await initializeDB();
    console.log("➡️ After initializeDB");

    console.log("➡️ Before initMinio");
    await initMinio();
    console.log("➡️ After initMinio");

    // Initialize Event-Driven Article Scheduler
    await initScheduler();

    app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
      console.log("🧪 Google Indexing & Event Scheduler ready.");
    });
  } catch (err) {
    console.error("Server startup failed", err);
    process.exit(1);
  }
})();