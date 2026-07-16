"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyGoogleIndexing = void 0;
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
// JSON file ka path (ensure karein file ka name sahi hai)
const keyPath = path_1.default.join(__dirname, '../service-account.json');
const jwtClient = new googleapis_1.google.auth.JWT({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/indexing'],
});
const indexing = googleapis_1.google.indexing('v3');
const notifyGoogleIndexing = (url) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        yield jwtClient.authorize();
        // requestBody ka use karne se 400 Bad Request error theek ho jayega
        const response = yield indexing.urlNotifications.publish({
            auth: jwtClient,
            requestBody: {
                url: url,
                type: 'URL_UPDATED',
            },
        });
        console.log('✅ Google Indexing Success:', response.data);
    }
    catch (error) {
        const errMsg = ((_c = (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.message) || error.message;
        console.error('❌ Google Indexing Error:', errMsg);
        if (errMsg.includes("ownership")) {
            console.log("💡 Solution: Search Console mein indexing@gyanmitra-485510.iam.gserviceaccount.com ko OWNER banayein.");
        }
    }
});
exports.notifyGoogleIndexing = notifyGoogleIndexing;
