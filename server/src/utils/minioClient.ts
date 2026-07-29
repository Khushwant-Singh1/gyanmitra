import { Client } from 'minio';
import dotenv from 'dotenv';
import { promises as fs, existsSync } from 'fs';
import path from 'path';

dotenv.config();

const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
const port = parseInt(process.env.MINIO_PORT || '9000', 10);
const useSSL = process.env.MINIO_USE_SSL === 'true';
const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
const bucketName = process.env.MINIO_BUCKET || 'gyanmitra';
const publicUrl = process.env.MINIO_PUBLIC_URL || `http://localhost:9000/${bucketName}`;

export const minioClient = new Client({
  endPoint,
  port,
  useSSL,
  accessKey,
  secretKey,
});

export const initMinio = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      console.log(`Bucket "${bucketName}" does not exist. Creating...`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket "${bucketName}" created successfully.`);

      // Set bucket policy to allow public read access
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };

      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`Public read policy applied to bucket "${bucketName}".`);
    } else {
      console.log(`Bucket "${bucketName}" already exists.`);
    }
  } catch (error) {
    console.warn('MinIO initialization warning (MinIO may be offline):', (error as Error).message);
  }
};

/**
 * Uploads a local file to MinIO bucket and returns its public URL.
 * If MinIO is unavailable, gracefully falls back to local storage URL.
 */
export const uploadFileToMinio = async (tempFilePath: string, destinationName: string): Promise<string> => {
  try {
    await minioClient.fPutObject(bucketName, destinationName, tempFilePath);
    // Delete temporary local file after successful MinIO upload
    try {
      await fs.unlink(tempFilePath);
    } catch (unlinkErr) {
      console.error('Temp file unlink error:', unlinkErr);
    }
    return `${publicUrl}/${destinationName}`;
  } catch (error) {
    console.warn(
      `MinIO upload unavailable for "${destinationName}". Falling back to local storage:`,
      (error as Error).message
    );
    // Return relative local storage path soExpress static route serves it
    return `/uploads/${destinationName}`;
  }
};

/**
 * Deletes a file from MinIO bucket and/or local storage
 */
export const deleteFileFromMinio = async (destinationName: string): Promise<void> => {
  try {
    await minioClient.removeObject(bucketName, destinationName);
    console.log(`Deleted file "${destinationName}" from MinIO.`);
  } catch (error) {
    console.warn(`MinIO deletion notice for "${destinationName}":`, (error as Error).message);
  }

  // Also clean up local file if present
  try {
    const localFilePath = path.join(process.cwd(), 'uploads', destinationName);
    if (existsSync(localFilePath)) {
      await fs.unlink(localFilePath);
      console.log(`Deleted local file "${destinationName}".`);
    }
  } catch (err) {
    console.error(`Local file cleanup error for "${destinationName}":`, err);
  }
};

