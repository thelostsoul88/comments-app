import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const allowed = ['image/jpeg','image/png','image/gif','text/plain'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!allowed.includes(file.mimetype)) {
    const err = new Error('Неверный тип файла');
    err.code = 'INVALID_FILE_TYPE';
    return cb(err);
  }
  cb(null, true);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 } });
