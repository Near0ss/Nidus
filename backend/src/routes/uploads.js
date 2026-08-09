import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { upload, publicUploadUrl } from '../middlewares/upload.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();

router.post('/uploads', authRequired, upload.array('files', 6), asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (!files.length && req.file) files.push(req.file);
  if (!files.length) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
  }
  res.status(201).json({
    success: true,
    urls: files.map((file) => publicUploadUrl(file.filename)),
    url: files[0] ? publicUploadUrl(files[0].filename) : null,
  });
}));

export default router;
