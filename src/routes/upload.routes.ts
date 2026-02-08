import { Router } from 'express';

import { uploadSingleFile } from '@/controllers/upload.controller';
import { requireAuthentication } from '@/middleware/auth';
import { handleMulterError, upload } from '@/middleware/multer';

const router = Router();

// Protect all upload routes
router.use(requireAuthentication);

router.post('/', upload.single('file'), handleMulterError, uploadSingleFile);
router.post(
  '/messages/:conversationId',
  upload.single('file'),
  handleMulterError,
  uploadSingleFile
);

export default router;
