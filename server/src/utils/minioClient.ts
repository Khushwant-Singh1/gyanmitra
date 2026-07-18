import { Client } from 'minio';
import dotenv from 'dotenv';

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
    console.error('Failed to initialize MinIO bucket:', error);
  }
};

/**
 * Uploads a local file to MinIO bucket and returns its public URL
 */
export const uploadFileToMinio = async (tempFilePath: string, destinationName: string): Promise<string> => {
  try {
    await minioClient.fPutObject(bucketName, destinationName, tempFilePath);
    return `${publicUrl}/${destinationName}`;
  } catch (error) {
    console.error(`Error uploading file "${destinationName}" to MinIO:`, error);
    throw error;
  }
};

/**
 * Deletes a file from MinIO bucket
 */
export const deleteFileFromMinio = async (destinationName: string): Promise<void> => {
  try {
    await minioClient.removeObject(bucketName, destinationName);
    console.log(`Deleted file "${destinationName}" from MinIO.`);
  } catch (error) {
    console.error(`Error deleting file "${destinationName}" from MinIO:`, error);
    throw error;
  }
};
