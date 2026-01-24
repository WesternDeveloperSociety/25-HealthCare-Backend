import { Router } from 'express';
import multer from 'multer';
import * as documentsController from '../controllers/documents.controller';
import {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  scanDocument,
} from '../controllers/documents.controller.js';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // temp local storage

// TODO: add Clerk requireAuth middleware to all routes

router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.post('/documents', upload.single('file'), documentsController.uploadDocument);
router.post('/scan', scanDocument);

export default router;
