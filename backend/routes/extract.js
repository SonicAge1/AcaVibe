import { Router } from 'express';
import { extractSkeleton } from '../services/deepseek.js';

const router = Router();

router.post('/', async (req, res) => {
  const { text, intent } = req.body;
  if (!text || !intent) {
    return res.status(400).json({ error: '缺少必要参数：text 和 intent' });
  }
  try {
    const result = await extractSkeleton(text, intent);
    res.json(result);
  } catch (err) {
    console.error('[extract]', err.message);
    res.status(500).json({ error: err.message || 'AI 处理失败，请稍后重试' });
  }
});

export default router;
