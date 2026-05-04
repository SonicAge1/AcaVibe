# AcaVibe 📚✨

> **学术表达自动化看板** | Academic Expression Automation Board

AcaVibe 帮助研究者和学生将日常思路快速转化为地道的学术表达。两大核心工具 + 一个按写作意图分类的闪卡词库，支持中英文界面切换。

---

## 功能一览

| 模块 | 功能 |
|------|------|
| 🔮 **学术骨架摘录器** (Skeleton Extractor) | 将文献长句泛化为带占位符的可复用句式模板 |
| 💬 **白话学术化翻译机** (Vibe Translator) | 大白话一键生成 3 个差异化学术词汇候选 |
| 🗂 **意图词库** (Intent Vault) | 按写作意图（对比、反驳、演进…）分类的闪卡式词库，支持键盘翻页 |

---

## 技术栈

- **前端**: React 18 + Vite + Tailwind CSS + lucide-react
- **后端**: Node.js + Express
- **AI**: DeepSeek API（OpenAI 兼容格式）
- **存储**: 本地 `vault.json`（无数据库依赖）
- **包管理**: pnpm workspaces (monorepo)

---

## 快速开始

### 1. 克隆 & 安装依赖

```bash
git clone https://github.com/SonicAge1/AcaVibe.git
cd AcaVibe
pnpm install
```

### 2. 配置 API Key

```bash
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入你的 DeepSeek API Key
```

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
PORT=3001
```

> DeepSeek API Key 申请地址：https://platform.deepseek.com/

### 3. 启动开发服务

```bash
# 同时启动前端（:5173）和后端（:3001）
pnpm dev
```

浏览器打开 [http://localhost:5173](http://localhost:5173) 即可使用。

---

## 目录结构

```
AcaVibe/
├── backend/
│   ├── routes/          # API 路由（extract / translate / vault）
│   ├── services/
│   │   ├── deepseek.js  # AI 调用逻辑
│   │   └── storage.js   # JSON 文件读写（带并发锁）
│   ├── data/            # vault.json 本地存储（已 gitignore）
│   ├── server.js
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/  # ExtractorPanel / VibeTranslator / KanbanVault
│       ├── hooks/       # useVault
│       ├── api/         # client.js (axios)
│       ├── i18n.js      # 中英文文案包
│       └── LangContext.jsx
└── package.json         # pnpm workspace 根配置
```

---

## 界面语言

点击右上角 🇺🇸 / 🇨🇳 按钮可随时切换中英文界面，适合对外展示使用。

---

## License

MIT
