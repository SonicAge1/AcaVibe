import OpenAI from 'openai';

let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    });
  }
  return client;
}

/**
 * 带重试的 AI 调用包装器（最多重试 2 次，指数退避）
 */
async function withRetry(fn, maxRetries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = 800 * Math.pow(2, attempt); // 800ms, 1600ms
        console.warn(`[deepseek] retry ${attempt + 1}/${maxRetries} after ${delay}ms — ${err.message}`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/**
 * 从模型输出中提取 JSON（防止被 ```json ... ``` 包裹）
 */
function parseJSON(raw) {
  const match = raw.trim().match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI 返回格式异常');
  return JSON.parse(match[0]);
}

/**
 * 模块一：提取学术句式骨架
 * @param {string} text 原文段落
 * @param {string} intent 学术意图
 * @returns {{ skeleton: string, hint: string }}
 */
export async function extractSkeleton(text, intent) {
  const ai = getClient();
  return withRetry(async () => {
    const completion = await ai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一名专业学术写作助手，专门帮助研究人员提炼可复用的学术句式。',
        },
        {
          role: 'user',
          content: `写作意图：${intent}
原文段落：
${text}

请完成以下任务：
1. 识别上述段落中的所有专有名词、特定研究对象、人名和数据，用 [A]、[B]、[C]、[Context] 等占位符替换；
2. 提取出纯粹的语法与逻辑骨架，保留连接词与句式结构；
3. 用一句话（中文）说明该骨架最适合的使用场景。

严格按如下 JSON 格式返回，不要添加任何额外文字：
{ "skeleton": "...", "hint": "..." }`,
        },
      ],
      temperature: 0.3,
    });
    return parseJSON(completion.choices[0].message.content);
  });
}

/**
 * 模块二：白话学术化翻译
 * @param {string} text 大白话输入
 * @returns {{ candidates: Array<{ word: string, hint: string }> }}
 */
export async function translateToAcademic(text) {
  const ai = getClient();
  return withRetry(async () => {
    const completion = await ai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一名专业学术写作助手，专门帮助研究人员将日常口语升级为正式学术表达。',
        },
        {
          role: 'user',
          content: `大白话输入：${text}

请提供恰好 3 个不同的英文正式学术词汇或短语，要求：
- 3 个候选词之间必须有明显的语义侧重差异；
- 每个候选词附一句中文说明其语境侧重点；
- 不得重复，不得使用简单同义词替换。

严格按如下 JSON 格式返回，不要添加任何额外文字：
{ "candidates": [
  { "word": "...", "hint": "..." },
  { "word": "...", "hint": "..." },
  { "word": "...", "hint": "..." }
]}`,
        },
      ],
      temperature: 0.7,
    });
    return parseJSON(completion.choices[0].message.content);
  });
}
