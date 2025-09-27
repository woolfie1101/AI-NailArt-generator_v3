import { supabaseAdmin } from '@/lib/supabase';

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'nail-art-assets';

export function getStorageBucket() {
  if (!STORAGE_BUCKET) {
    throw new Error('SUPABASE_STORAGE_BUCKET is not configured');
  }
  return STORAGE_BUCKET;
}

export async function uploadImageToStorage(path: string, buffer: Buffer) {
  const bucket = getStorageBucket();
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw error;
  }
}

export async function createSignedUrl(path: string, expiresInSeconds = 60 * 60) {
  const bucket = getStorageBucket();
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) {
    throw error || new Error('Failed to create signed URL');
  }

  return data.signedUrl;
}

export async function createSignedUrls(paths: string[], expiresInSeconds = 60 * 60) {
  const bucket = getStorageBucket();
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrls(paths, expiresInSeconds);

  if (error || !data) {
    throw error || new Error('Failed to create signed URLs');
  }

  return data.reduce<Record<string, string>>((acc, cur) => {
    if (cur.signedUrl) {
      acc[cur.path] = cur.signedUrl;
    }
    return acc;
  }, {});
}

export async function removeFromStorage(path: string) {
  const bucket = getStorageBucket();
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) {
    throw error;
  }
}
