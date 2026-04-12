import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
       res.status(400).json({ message: 'No file uploaded' });
       return;
    }

    // Determine resource type based on file extension
    const isPdf = req.file.mimetype === 'application/pdf';
    const resourceType = isPdf ? 'raw' : 'image';

    // Upload to Cloudinary using a stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'speedcopy_uploads',
        resource_type: 'auto', // Let cloudinary decide or force based on type
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Upload to Cloudinary failed', error });
        }
        
        res.status(200).json({
          message: 'Upload successful',
          url: result?.secure_url,
          public_id: result?.public_id,
          format: result?.format,
          resource_type: result?.resource_type,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
