import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import extractRouter from './routes/extract.js';
import translateRouter from './routes/translate.js';
import vaultRouter from './routes/vault.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/extract', extractRouter);
app.use('/api/translate', translateRouter);
app.use('/api/vault', vaultRouter);

// 生产环境：serve 前端静态文件
const frontendDist = join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ AcaVibe backend running at http://localhost:${PORT}`);
});
