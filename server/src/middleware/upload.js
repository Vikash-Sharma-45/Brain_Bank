import multer from 'multer';
import AppError from '../utils/AppError.js';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/markdown',
  'text/plain', // some systems send .md as text/plain
]);

const ALLOWED_EXTENSIONS = /\.(pdf|docx|md)$/i;

/**
 * Multer configured with memory storage, size limit, and MIME + extension allowlist.
 * Exposes a single `upload.single('file')` middleware for note uploads.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const mimeOk = ALLOWED_MIMES.has(file.mimetype);
    const extOk = ALLOWED_EXTENSIONS.test(file.originalname);

    if (mimeOk || extOk) {
      return cb(null, true);
    }

    cb(new AppError('Only .pdf, .docx, and .md files are allowed', 400));
  },
});

export default upload;
