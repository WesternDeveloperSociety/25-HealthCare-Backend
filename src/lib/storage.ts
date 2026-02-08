// src/lib/storage.ts
import { Storage } from '@google-cloud/storage';
import crypto from 'node:crypto';

const isDev = process.env.NODE_ENV !== 'production';

export const storage = new Storage(
  isDev
    ? {
        projectId: 'dev',
        apiEndpoint: process.env.GCS_EMULATOR_HOST!, // ! asserts are captured by startup.ts
      }
    : {
        projectId: process.env.GCP_PROJECT_ID!, // ! asserts are captured by startup.ts
      }
);

export const bucket = storage.bucket(process.env.GCS_BUCKET!);

export const getSignedUrl = async (fileName: string): Promise<string> => {
  // For development with fake-gcs-server, we can't easily generate real signed URLs
  // without a real service account key. We'll fallback to a direct URL for dev
  // BUT it simulates the concept.
  if (isDev) {
    return `http://localhost:4443/${process.env.GCS_BUCKET}/${fileName}`;
  }

  const [url] = await bucket.file(fileName).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return url;
};

export const uploadFile = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<{ key: string; signedUrl: string }> => {
  const fileName = `${folder}/${crypto.randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const blob = bucket.file(fileName);

  await blob.save(file.buffer, {
    contentType: file.mimetype,
    resumable: false,
    // explicitly private (though it is default)
    predefinedAcl: 'private',
  });

  const signedUrl = await getSignedUrl(fileName);

  return { key: fileName, signedUrl };
};
