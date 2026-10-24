import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import env from '../config/env.js';

/**
 * All R2/S3 file operations live here.
 * To swap providers, edit only this file.
 */

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = env.R2_BUCKET_NAME;

/**
 * Generate a random object key preserving the original extension.
 * e.g. "a3f1b2c4-...-notes.pdf" → "a3f1b2c4-...pdf"
 */
const generateKey = (originalFilename) => {
  const ext = path.extname(originalFilename).toLowerCase();
  return `${uuidv4()}${ext}`;
};

/**
 * Upload a file buffer to R2.
 * @param {Buffer} buffer - File contents
 * @param {string} originalFilename - Original name (used for extension)
 * @param {string} mimeType - MIME type
 * @returns {{ key: string }} The generated object key
 */
export const uploadFile = async (buffer, originalFilename, mimeType) => {
  const key = generateKey(originalFilename);

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return { key };
};

/**
 * Generate a short-lived signed URL for private file access.
 * @param {string} key - R2 object key
 * @param {number} [expiresIn=600] - Seconds until expiry (default 10 min)
 * @returns {string} Pre-signed URL
 */
export const getSignedUrl = async (key, expiresIn = 600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return awsGetSignedUrl(s3, command, { expiresIn });
};

/**
 * Delete a file from R2.
 * @param {string} key - R2 object key
 */
export const deleteFile = async (key) => {
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
};
