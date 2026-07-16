console.log("🟢 index.ts file loaded");

import dotenv from "dotenv";
dotenv.config();

console.log("🟢 dotenv loaded");

import { app } from "./app";
console.log("🟢 app imported");

import { initializeDB } from "./db/index.db";
console.log("🟢 initializeDB imported");

// Indexing function import karein
import { notifyGoogleIndexing } from "./utils/googleIndexer"; 
import { Article } from "./models/article.models";
import { ARTICLE_STATUS, ARTICLE_ACTIONS } from "./constants";

const PORT = Number(process.env.PORT) || 8000;

(async () => {
  try {
    console.log("➡️ Before initializeDB");
    await initializeDB();
    console.log("➡️ After initializeDB");

    app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
      
      // TEST CALL: Server start hote hi Indexing test karein
      console.log("🧪 Testing Google Indexing API...");
    });
  } catch (err) {
    console.error("Server startup failed", err);
    process.exit(1);
  }
})();

const runScheduler = async () => {
  try {
    const now = new Date();
    const articlesToPublish = await Article.find({
      status: ARTICLE_STATUS.Scheduled,
      scheduledPublishDate: { $lte: now },
    });

    if (articlesToPublish.length > 0) {
      console.log(`⏰ Scheduler found ${articlesToPublish.length} articles to publish.`);
      for (const article of articlesToPublish) {
        article.status = ARTICLE_STATUS.Published;
        article.lastPublishedDate = article.scheduledPublishDate || now;
        article.scheduledPublishDate = undefined;
        article.actions.push({
          userId: article.authorId,
          type: ARTICLE_ACTIONS.Publish,
          timeStamp: now,
        });

        await article.save();
        console.log(`✅ Automatically published scheduled article: "${article.headline}" (Slug: ${article.slug})`);

        const articleUrl = `${process.env.CLIENT_URL || "https://gyanmitranews.com"}/articles/${article.slug}`;
        notifyGoogleIndexing(articleUrl).catch((err) => {
          console.error(`❌ Google Indexing failed for scheduled article "${article.slug}":`, err);
        });
      }
    }
  } catch (error) {
    console.error("❌ Scheduler error:", error);
  }
};

// Check every 60 seconds
setInterval(runScheduler, 60000);