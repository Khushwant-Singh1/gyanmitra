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
console.log("🟢 index.ts file loaded");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log("🟢 dotenv loaded");
const app_1 = require("./app");
console.log("🟢 app imported");
const index_db_1 = require("./db/index.db");
console.log("🟢 initializeDB imported");
const PORT = Number(process.env.PORT) || 8000;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("➡️ Before initializeDB");
        yield (0, index_db_1.initializeDB)();
        console.log("➡️ After initializeDB");
        app_1.app.listen(PORT, () => {
            console.log(`🚀 Backend running on port ${PORT}`);
            // TEST CALL: Server start hote hi Indexing test karein
            console.log("🧪 Testing Google Indexing API...");
        });
    }
    catch (err) {
        console.error("Server startup failed", err);
        process.exit(1);
    }
}))();
setInterval(() => { }, 1000);
