import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const uploadDir = path.resolve(process.cwd(), config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBasename = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 30);
    const uniqueName = `${Date.now()}-${uuidv4()}-${cleanBasename}${ext}`;
    cb(null, uniqueName);
  }
});

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      ApiError.badRequest(
        'Invalid file type. Allowed formats: JPEG, PNG, WEBP, GIF.',
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSizeMb * 1024 * 1024
  },
  fileFilter
});

export const verifyImageMagicBytes = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return false;
  let fd;
  try {
    const buffer = Buffer.alloc(16);
    fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);
    fd = null;

    if (bytesRead < 4) return false;

    // JPEG: FF D8 FF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    // GIF: 47 49 46 38 ('GIF8')
    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
    // WebP: RIFF (52 49 46 46) .... WEBP (57 45 42 50 at offset 8)
    const isWebp = bytesRead >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

    return isJpeg || isPng || isGif || isWebp;
  } catch (err) {
    if (fd !== null && fd !== undefined) {
      try { fs.closeSync(fd); } catch (e) {}
    }
    return false;
  }
};

export const deleteUploadedFile = (filename) => {
  if (!filename) return;
  try {
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(uploadDir, safeFilename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    // Ignore deletion errors during cleanup
  }
};

export default {
  upload,
  deleteUploadedFile
};

