import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bizora_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  }
});

// Multer upload middleware
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Safe cleanup function for legacy local files (imported by business.service.js)
export const deleteUploadedFile = (filename) => {
  if (!filename) return;
  try {
    const uploadDir = path.resolve(process.cwd(), 'uploads');
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(uploadDir, safeFilename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    // Ignore cleanup errors
  }
};

export default {
  upload,
  deleteUploadedFile
};