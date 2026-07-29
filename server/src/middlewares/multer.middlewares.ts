import multer, { FileFilterCallback } from 'multer';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError.utils';

// Ensure './uploads' folder exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 1. Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Files './uploads' folder mein save hongi
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    // UUID ka use karke file ko unique name diya gaya hai taaki overlap na ho
    const uniqueName = uuid() + ext;
    cb(null, uniqueName);
  },
});

// 2. File Filter (MIME Type Validation)
function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  /** * Humne 'application/pdf' add kiya hai taaki students apne projects submit kar sakein
   * Baaki allowed types: images (jpeg, png) aur videos (mp4)
   */
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/avif',
    'video/mp4',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Agar format galat hai toh error return karein
    cb(new ApiError(400, 'Format not supported! Only common image, video, and PDF files are allowed.') as any);
  }
}

// 3. Export Multer Instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // File size limit 10MB rakhi gayi hai
  },
});