// src/lib/startupChecks.ts
import prisma from '@/lib/prisma';
import { bucket } from '@/lib/storage';

export async function startupChecks() {
  console.log('Running startup checks...');

  // ---------------- ENV VARS ----------------
  const required = [
    'DATABASE_URL',
    'GCS_BUCKET',
    'CLERK_SECRET_KEY',
    'CLIENT_URL',
    'PORT',
  ];

  if (process.env.NODE_ENV === 'production') {
    required.push('GCP_PROJECT_ID');
  } else {
    required.push('GCS_EMULATOR_HOST');
  }

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing env var: ${key}`);
    }
  }

  // ---------------- DATABASE ----------------
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database OK');
  } catch (err) {
    console.error('Database connection failed');
    throw err;
  }

  // ---------------- STORAGE ----------------
  try {
    const [exists] = await bucket.exists();

    if (!exists) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('GCS bucket does not exist');
      }

      console.log('Creating dev bucket...');
      await bucket.create();
    }

    console.log('Storage OK');
  } catch (err) {
    console.error('Storage check failed');
    throw err;
  }

  console.log('Startup checks complete ✅');
}
