import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

let jwtClient: any = null;

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (clientEmail && privateKey) {
  jwtClient = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
} else {
  const keyPath = path.join(__dirname, '../service-account.json');
  if (fs.existsSync(keyPath)) {
    jwtClient = new google.auth.JWT({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
  }
}

const indexing = google.indexing('v3');

export const notifyGoogleIndexing = async (url: string) => {
  try {
    if (!jwtClient) {
      console.warn('⚠️ Google Indexing skipped: Credentials not configured (GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY or service-account.json missing).');
      return;
    }

    await jwtClient.authorize();

    // requestBody ka use karne se 400 Bad Request error theek ho jayega
    const response = await indexing.urlNotifications.publish({
      auth: jwtClient,
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });

    console.log('✅ Google Indexing Success:', response.data);
  } catch (error: any) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error('❌ Google Indexing Error:', errMsg);
    
    if (errMsg.includes("ownership")) {
      console.log("💡 Solution: Search Console mein indexing@gyanmitra-485510.iam.gserviceaccount.com ko OWNER banayein.");
    }
  }
};