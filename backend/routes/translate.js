import { Router } from 'express';
import { translateToAcademic } from '../services/deepseek.js';

const router = Router();

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: '缺少必要参数：text' });
  }
  try {
    const result = await translateToAcademic(text);
    res.json(result);
  } catch (err) {
    console.error('[translate]', err.message);
    res.status(500).json({ error: err.message || 'AI 处理失败，请稍后重试' });
  }
});

export default router;
