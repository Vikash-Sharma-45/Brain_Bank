import multer from 'multer';
import AppError from '../utils/AppError.js';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const ALLOWED_FILE_TYPES = {
  '.pdf': new Set(['application/pdf']),
  '.docx': new Set([
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
  '.md': new Set(['text/markdown', 'text/plain']),
};

/**
 * Multer configured with memory storage, size limit, and MIME + extension allowlist.
 * Exposes a single `upload.single('file')` middleware for note uploads.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const extension = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    const allowedMimes = ALLOWED_FILE_TYPES[extension];

    if (allowedMimes?.has(file.mimetype)) {
      return cb(null, true);
    }

    cb(new AppError('Upload a .pdf, .docx, or .md file with its matching file type', 400));
  },
});

export default upload;
