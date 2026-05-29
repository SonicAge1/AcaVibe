import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Mutex } from 'async-mutex';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../data');
const VAULT_FILE = join(DATA_DIR, 'vault.json');

const mutex = new Mutex();

const DEFAULT_DATA = {
  intents: ['对比差异', '提出反驳', '说明演进', '引入背景', '得出结论', '描述特征'],
  items: [],
};

async function ensureDataFile() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(VAULT_FILE)) {
    await writeFile(VAULT_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
  }
}

export async function readVault() {
  await ensureDataFile();
  const raw = await readFile(VAULT_FILE, 'utf-8');
  return JSON.parse(raw);
}

export async function writeVault(data) {
  const release = await mutex.acquire();
  try {
    await ensureDataFile();
    await writeFile(VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } finally {
    release();
  }
}

export async function addItem(item) {
  const release = await mutex.acquire();
  try {
    await ensureDataFile();
    const raw = await readFile(VAULT_FILE, 'utf-8');
    const data = JSON.parse(raw);
    data.items.unshift(item); // 最新的排在前面
    await writeFile(VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  } finally {
    release();
  }
}

export async function addIntent(name) {
  const release = await mutex.acquire();
  try {
    await ensureDataFile();
    const raw = await readFile(VAULT_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (data.intents.includes(name)) return { error: 'duplicate' };
    data.intents.push(name);
    await writeFile(VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  } finally {
    release();
  }
}

export async function removeIntent(name) {
  const release = await mutex.acquire();
  try {
    await ensureDataFile();
    const raw = await readFile(VAULT_FILE, 'utf-8');
    const data = JSON.parse(raw);
    const hasItems = data.items.some(item => item.intent === name);
    if (hasItems) return { error: 'not_empty' };
    data.intents = data.intents.filter(i => i !== name);
    await writeFile(VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  } finally {
    release();
  }
}

export async function importVault(incoming) {
  const release = await mutex.acquire();
  try {
    await ensureDataFile();
    const raw = await readFile(VAULT_FILE, 'utf-8');
    const data = JSON.parse(raw);
    // 合并意图
    const intentSet = new Set(data.intents);
    (incoming.intents || []).forEach(i => intentSet.add(i));
    data.intents = [...intentSet];
    // 合并条目（id 不重复才追加）
    const existingIds = new Set(data.items.map(i => i.id));
    const newItems = (incoming.items || []).filter(i => !existingIds.has(i.id));
    data.items = [...newItems, ...data.items];
    await writeFile(VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  } finally {
    release();
  }
}

export async function updateItem(id, patch) {
  const release = await mutex.acquire();
  try {
    await ensureDataFile();
    const raw = await readFile(VAULT_FILE, 'utf-8');
    const data = JSON.parse(raw);
    const idx = data.items.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    data.items[idx] = { ...data.items[idx], ...patch };
    await writeFile(VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data.items[idx];
  } finally {
    release();
  }
}

export async function deleteItems(ids) {
  const idSet = new Set(ids);
  const release = await mutex.acquire();
  try {
    await ensureDataFile();
    const raw = await readFile(VAULT_FILE, 'utf-8');
    const data = JSON.parse(raw);
    data.items = data.items.filter((item) => !idSet.has(item.id));
    await writeFile(VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  } finally {
    release();
  }
}

export async function deleteItem(id) {
  const release = await mutex.acquire();
  try {
    await ensureDataFile();
    const raw = await readFile(VAULT_FILE, 'utf-8');
    const data = JSON.parse(raw);
    data.items = data.items.filter((item) => item.id !== id);
    await writeFile(VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  } finally {
    release();
  }
}
