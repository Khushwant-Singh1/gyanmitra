import { google } from 'googleapis';
import path from 'path';

// JSON file ka path (ensure karein file ka name sahi hai)
const keyPath = path.join(__dirname, '../service-account.json');

const jwtClient = new google.auth.JWT({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/indexing'],
});

const indexing = google.indexing('v3');

export const notifyGoogleIndexing = async (url: string) => {
  try {
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