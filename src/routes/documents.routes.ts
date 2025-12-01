import { Router } from 'express';
import {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  scanDocument,
} from '../controllers/documents.controller.js';

const router = Router();

// TODO: add Clerk requireAuth middleware to all routes

router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.post('/', uploadDocument);
router.post('/scan', scanDocument);

export default router;
