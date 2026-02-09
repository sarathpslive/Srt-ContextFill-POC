import { Router, Request, Response } from 'express';
import multer from 'multer';
import { geminiService } from '../services/gemini.service';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// POST /api/documents/extract - Extract form data from uploaded document
router.post('/extract', upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📄 Processing document: ${req.file.originalname} (${req.file.mimetype})`);
    
    const fileBase64 = req.file.buffer.toString('base64');
    const extractedData = await geminiService.extractFormData(fileBase64, req.file.mimetype);
    
    console.log('✅ Extracted data:', extractedData);
    
    res.json({
      success: true,
      data: extractedData,
      filename: req.file.originalname,
      mimeType: req.file.mimetype
    });
  } catch (error) {
    console.error('❌ Error extracting document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract data from document';
    res.status(500).json({ error: errorMessage });
  }
});

// POST /api/documents/extract-base64 - Extract form data from base64 encoded document
router.post('/extract-base64', async (req: Request, res: Response) => {
  try {
    const { data, mimeType, filename } = req.body;
    
    if (!data || !mimeType) {
      return res.status(400).json({ error: 'Missing required fields: data, mimeType' });
    }

    console.log(`📄 Processing base64 document: ${filename || 'unknown'} (${mimeType})`);
    
    // Remove data URL prefix if present
    const base64Data = data.replace(/^data:[^;]+;base64,/, '');
    
    const extractedData = await geminiService.extractFormData(base64Data, mimeType);
    
    console.log('✅ Extracted data:', extractedData);
    
    res.json({
      success: true,
      data: extractedData,
      filename: filename || 'uploaded-document',
      mimeType
    });
  } catch (error) {
    console.error('❌ Error extracting document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract data from document';
    res.status(500).json({ error: errorMessage });
  }
});

export { router as documentRoutes };
