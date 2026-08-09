import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { getJwtSecret } from './src/lib/auth.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { uploadsDir } from './src/middlewares/upload.js';
import authRoutes from './src/routes/auth.js';
import usersRoutes from './src/routes/users.js';
import servicesRoutes from './src/routes/services.js';
import freelancersRoutes from './src/routes/freelancers.js';
import contractsRoutes from './src/routes/contracts.js';
import messagesRoutes from './src/routes/messages.js';
import postsRoutes from './src/routes/posts.js';
import followsRoutes from './src/routes/follows.js';
import notificationsRoutes from './src/routes/notifications.js';
import financeRoutes from './src/routes/finance.js';
import statsRoutes from './src/routes/stats.js';
import reviewsRoutes from './src/routes/reviews.js';
import savedRoutes from './src/routes/saved.js';
import searchRoutes from './src/routes/search.js';
import uploadsRoutes from './src/routes/uploads.js';
import homeRoutes from './src/routes/home.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  getJwtSecret();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const corsOrigins = String(process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Muitas tentativas. Aguarde um pouco e tente de novo.' },
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'Backend is running', db: 'prisma' });
});

app.use('/api/login', authLimiter);
app.use('/api/login/google', authLimiter);
app.use('/api/register', authLimiter);
app.use('/api/register-user', authLimiter);
app.use('/api', authRoutes);
app.use('/api', usersRoutes);
app.use('/api', servicesRoutes);
app.use('/api', freelancersRoutes);
app.use('/api', contractsRoutes);
app.use('/api', messagesRoutes);
app.use('/api', postsRoutes);
app.use('/api', followsRoutes);
app.use('/api', notificationsRoutes);
app.use('/api', financeRoutes);
app.use('/api', statsRoutes);
app.use('/api', reviewsRoutes);
app.use('/api', savedRoutes);
app.use('/api', searchRoutes);
app.use('/api', uploadsRoutes);
app.use('/api', homeRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Nidus API em http://localhost:${PORT}`);
});
