import { HttpError } from '../lib/errors.js';

export function errorHandler(err, _req, res, _next) {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'Arquivo muito grande. Máximo 5 MB.' });
  }
  if (err?.message?.includes('Tipo de arquivo')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, message: err.message, ...err.extra });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
}
