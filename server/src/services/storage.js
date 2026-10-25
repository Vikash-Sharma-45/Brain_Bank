import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import env from '../config/env.js';

/**
 * All file storage operations live here.
 * To swap providers, edit only this file.
 */
const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const BUCKET = env.SUPABASE_BUCKET;

/**
 * Generate a random object key preserving the original extension.
 */
const generateKey = (originalFilename) => {
  const ext = path.extname(originalFilename).toLowerCase();
  return `${uuidv4()}${ext}`;
};

/**
 * Upload a file buffer to private storage.
 * @param {Buffer} buffer - File contents
 * @param {string} originalFilename - Original name, used only for extension
 * @param {string} contentType - File MIME type
 * @returns {{ key: string }} The generated object key
 */
export const uploadFile = async (buffer, originalFilename, contentType) => {
  const key = generateKey(originalFilename);
  const { error } = await supabase.storage.from(BUCKET).upload(key, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Supabase storage upload failed: ${error.message}`);
  }

  return { key };
};

/**
 * Generate a short-lived signed URL for private file access.
 * @param {string} key - Storage object key
 * @param {number} [expiresIn=600] - Seconds until expiry (default 10 min)
 * @returns {string} Signed URL
 */
export const getSignedUrl = async (key, expiresIn = 600) => {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(key, expiresIn);

  if (error) {
    throw new Error(`Supabase storage signed URL failed: ${error.message}`);
  }
  if (!data?.signedUrl) {
    throw new Error('Supabase storage did not return a signed URL');
  }

  return data.signedUrl;
};

/**
 * Delete a file from private storage.
 * @param {string} key - Storage object key
 */
export const deleteFile = async (key) => {
  if (!key) return;

  const { error } = await supabase.storage.from(BUCKET).remove([key]);
  if (error) {
    throw new Error(`Supabase storage delete failed: ${error.message}`);
  }
};
