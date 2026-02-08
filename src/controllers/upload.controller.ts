import { getAuth } from '@clerk/express';
import type { Request, Response } from 'express';

import prisma from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';
import { AppError } from '@/utils/AppError';

export const uploadSingleFile = async (req: Request, res: Response) => {
  if (!req.file) {
    throw AppError.BadRequest('No file uploaded');
  }

  const { key, signedUrl } = await uploadFile(req.file, 'uploads');

  res.status(200).json({
    status: 'success',
    data: {
      key,
      url: signedUrl,
      expiresIn: 900, // 15 mins
    },
  });
};

export const uploadMessageFile = async (req: Request, res: Response) => {
  if (!req.file) {
    throw AppError.BadRequest('No file uploaded');
  }

  const { conversationId } = req.params;
  const auth = getAuth(req);

  if (!auth.userId) {
    throw AppError.Unauthorized('User not authenticated');
  }

  if (!conversationId) {
    throw AppError.BadRequest('Conversation ID is required or Not Found');
  }

  const { key, signedUrl } = await uploadFile(req.file, 'messages');

  res.status(200).json({
    status: 'success',
    data: {
      key,
      url: signedUrl,
      expiresIn: 900, // 15 mins
    },
  });
};
