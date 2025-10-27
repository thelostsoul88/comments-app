import express from 'express';
import { upload } from '../utils/fileUpload.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });

    if (req.file.mimetype.startsWith('image/')) {
      const imagePath = req.file.path;
      const outPath = imagePath + '_resized.jpg';
      const image = sharp(imagePath);
      const meta = await image.metadata();
      if (meta.width > 320 || meta.height > 240) {
        await image.resize(320, 240, { fit: 'inside' }).toFile(outPath);
        fs.unlinkSync(imagePath);
        req.file.filename = path.basename(outPath);
      }
    }
    res.json({ url: `/uploads/${req.file.filename}`, type: req.file.mimetype });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'upload error' });
  }
});

export default router;
