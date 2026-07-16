"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
// 1. Storage Configuration
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // Files './uploads' folder mein save hongi
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const ext = path_1.default.extname(file.originalname);
        // UUID ka use karke file ko unique name diya gaya hai taaki overlap na ho
        const uniqueName = (0, uuid_1.v4)() + ext;
        cb(null, uniqueName);
    },
});
// 2. File Filter (MIME Type Validation)
function fileFilter(req, file, cb) {
    /** * Humne 'application/pdf' add kiya hai taaki students apne projects submit kar sakein
     * Baaki allowed types: images (jpeg, png) aur videos (mp4)
     */
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'video/mp4',
        'application/pdf'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        // Agar format galat hai toh error return karein
        cb(new Error('Format not supported! Only JPG, PNG, MP4 and PDF files are allowed.'));
    }
}
// 3. Export Multer Instance
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // File size limit 10MB rakhi gayi hai
    },
});
