import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';

import { fileURLToPath } from 'node:url';
import { pool } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errors.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';

const app = express();
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, '..');
const isLocalOrigin = origin => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ credentials: true, origin(origin, callback) { if (!origin || env.clientUrls.includes(origin) || (env.nodeEnv !== 'production' && isLocalOrigin(origin))) return callback(null, true); return callback(new Error(`Origin is not allowed by CORS: ${origin}`)); } }));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(currentDir, 'uploads')));
app.get('/api/health', async (_request, response) => { await pool.query('SELECT 1'); response.json({ success: true, data: { status: 'ok', database: 'connected' } }); });
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
if (env.nodeEnv === 'production') { const dist = path.resolve(rootDir, 'dist'); app.use(express.static(dist)); app.get('*', (_request, response) => response.sendFile(path.join(dist, 'index.html'))); } else { app.use(notFound); }
app.use(errorHandler);
app.listen(env.port, () => console.log(`Sharuu API running on http://localhost:${env.port}`));
