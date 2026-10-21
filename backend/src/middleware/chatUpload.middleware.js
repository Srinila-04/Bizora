import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const chatUploadDir = path.resolve(process.cwd(), config.upload.dir, 'chat-attachments');
if (!fs.existsSync(chatUploadDir)) {
  fs.mkdirSync(chatUploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Storage configuration with sanitized naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, chatUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBasename = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 30);
    const uniqueName = `${Date.now()}-${uuidv4()}-${cleanBasename || 'attachment'}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      ApiError.badRequest(
        'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are supported for chat attachments.',
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
  cb(null, true);
};

// 5MB maximum upload size
const MAX_CHAT_FILE_SIZE = 5 * 1024 * 1024;

export const uploadChatAttachment = multer({
  storage,
  limits: {
    fileSize: MAX_CHAT_FILE_SIZE
  },
  fileFilter
});

/**
 * Validate image content via binary magic bytes (prevents disguised executables / non-images).
 * @param {string} filePath - Absolute path to the uploaded file.
 * @returns {Promise<boolean>}
 */
export const verifyImageMagicBytes = async (filePath) => {
  try {
    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    // JPEG: FF D8 FF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;

    // GIF: GIF87a or GIF89a
    const isGif =
      buffer.toString('ascii', 0, 6) === 'GIF87a' ||
      buffer.toString('ascii', 0, 6) === 'GIF89a';

    // WEBP: RIFF....WEBP
    const isWebp =
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';

    return isJpeg || isPng || isGif || isWebp;
  } catch (err) {
    return false;
  }
};

export const deleteChatFile = (filename) => {
  if (!filename) return;
  try {
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(chatUploadDir, safeFilename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    // Ignore cleanup deletion errors
  }
};

export { chatUploadDir };
export default {
  uploadChatAttachment,
  verifyImageMagicBytes,
  deleteChatFile,
  chatUploadDir
};

