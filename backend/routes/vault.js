import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  readVault, addItem, updateItem,
  deleteItems, deleteItem,
  addIntent, removeIntent, importVault,
} from '../services/storage.js';

const router = Router();

// GET /api/vault — 获取全部数据
router.get('/', async (req, res) => {
  try {
    const data = await readVault();
    res.json(data);
  } catch (err) {
    console.error('[vault GET]', err.message);
    res.status(500).json({ error: '读取数据失败' });
  }
});

// GET /api/vault/export — 导出 JSON 文件
router.get('/export', async (req, res) => {
  try {
    const data = await readVault();
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Disposition', `attachment; filename="acavibe-vault-${date}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (err) {
    console.error('[vault export]', err.message);
    res.status(500).json({ error: '导出失败' });
  }
});

// POST /api/vault/import — 导入并合并 JSON
router.post('/import', async (req, res) => {
  const { vault } = req.body;
  if (!vault || typeof vault !== 'object') {
    return res.status(400).json({ error: '请求体必须包含 vault 对象' });
  }
  try {
    const data = await importVault(vault);
    res.json(data);
  } catch (err) {
    console.error('[vault import]', err.message);
    res.status(500).json({ error: '导入失败' });
  }
});

// POST /api/vault/intents — 新增意图
router.post('/intents', async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: '意图名称不能为空' });
  }
  if (name.trim().length > 16) {
    return res.status(400).json({ error: '意图名称最多 16 个字符' });
  }
  const result = await addIntent(name.trim());
  if (result.error === 'duplicate') {
    return res.status(409).json({ error: '意图已存在' });
  }
  res.status(201).json(result);
});

// DELETE /api/vault/intents/:name — 删除空意图
router.delete('/intents/:name', async (req, res) => {
  const result = await removeIntent(decodeURIComponent(req.params.name));
  if (result && result.error === 'not_empty') {
    return res.status(409).json({ error: '该意图下还有卡片，无法删除' });
  }
  res.json(result);
});

// POST /api/vault — 保存一条新条目
router.post('/', async (req, res) => {
  const { type, intent, skeleton, word, translation, hint, source } = req.body;
  if (!type || !intent || !hint || !source) {
    return res.status(400).json({ error: '缺少必要字段' });
  }
  if (type === 'skeleton' && !skeleton) {
    return res.status(400).json({ error: 'skeleton 类型必须提供 skeleton 字段' });
  }
  if (type === 'word' && !word) {
    return res.status(400).json({ error: 'word 类型必须提供 word 字段' });
  }

  const item = {
    id: uuidv4(),
    type,
    intent,
    ...(type === 'skeleton' ? { skeleton } : { word, ...(translation ? { translation } : {}) }),
    hint,
    source,
    createdAt: new Date().toISOString(),
  };

  try {
    const data = await addItem(item);
    res.status(201).json({ item, data });
  } catch (err) {
    console.error('[vault POST]', err.message);
    res.status(500).json({ error: '保存失败' });
  }
});

// PATCH /api/vault/:id — 更新单条条目的字段（如 status）
const VALID_STATUSES = ['unreviewed', 'reviewing', 'mastered'];

router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status 值非法，合法值：${VALID_STATUSES.join(', ')}` });
  }
  try {
    const updated = await updateItem(req.params.id, { status });
    if (!updated) return res.status(404).json({ error: '条目不存在' });
    res.json(updated);
  } catch (err) {
    console.error('[vault PATCH]', err.message);
    res.status(500).json({ error: '更新失败' });
  }
});

// DELETE /api/vault/batch — 批量删除（body: { ids: string[] }）
router.delete('/batch', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids 必须是非空数组' });
  }
  try {
    const data = await deleteItems(ids);
    res.json(data);
  } catch (err) {
    console.error('[vault DELETE batch]', err.message);
    res.status(500).json({ error: '批量删除失败' });
  }
});

// DELETE /api/vault/:id — 删除一条条目
router.delete('/:id', async (req, res) => {
  try {
    const data = await deleteItem(req.params.id);
    res.json(data);
  } catch (err) {
    console.error('[vault DELETE]', err.message);
    res.status(500).json({ error: '删除失败' });
  }
});

export default router;
