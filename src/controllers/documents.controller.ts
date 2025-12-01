import type { Request, Response } from 'express';

let documents: any[] = [
  {
    id: '1',
    appointmentID: '1',
    fileURL: 'https://storage.example.com/doc-123.pdf',
    title: 'Lab Results',
    docType: 'lab-result',
    uploadedAttachment: 'results.pdf',
    uploadedAt: '2025-11-20T15:30:00Z',
  },
];

/**
 * GET /api/documents
 * List all documents (filtered by user, type, date, tags)
 */
export const getAllDocuments = async (req: Request, res: Response) => {
  // TODO: connect to Postgres + schema
  // TODO: Add filtering by userID, documentType, date range, tags, area of medicine
  res.json(documents);
};

/**
 * GET /api/documents/:id
 * Get specific document details
 */
export const getDocumentById = async (req: Request, res: Response) => {
  // TODO: connect to Postgres + schema
  const { id } = req.params;
  const document = documents.find((d) => d.id === id);

  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  res.json(document);
};

/**
 * POST /api/documents
 * Upload new document (PDF, JPG, PNG, etc.)
 */
export const uploadDocument = async (req: Request, res: Response) => {
  // TODO: connect to Postgres + schema
  // TODO: Integrate file upload

  const newDocument = {
    id: Date.now().toString(),
    appointmentID: req.body.appointmentID,
    fileURL: req.body.fileURL,
    title: req.body.title,
    docType: req.body.docType,
    uploadedAttachment: req.body.uploadedAttachment,
    uploadedAt: new Date().toISOString(),
    ...req.body, // Allow other fields
  };

  documents.push(newDocument);
  res.status(201).json(newDocument);
};

/**
 * POST /api/documents/scan
 * OCR/Image recognition to parse document data
 */
export const scanDocument = async (req: Request, res: Response) => {
  // TODO: connect to Postgres + schema
  // TODO: Integrate OCR/image recognition
  res.status(201).json({
    documentID: 'temp-id-123',
    extractedData: {
      documentType: 'prescription',
      date: '2025-11-15',
      medications: ['Lisinopril 10mg'],
      doctorName: 'Dr. Smith',
    },
    tags: ['prescription', 'cardiology'],
    message: 'Document scanned successfully',
  });
};
