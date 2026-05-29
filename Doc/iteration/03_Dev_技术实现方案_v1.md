# Dev · 技术实现方案 v1

## 读 PM 设计方案结论

### 改动范围评估
- 后端：vault.js 路由新增 PATCH 接口；storage.js 新增 updateItem
- 前端：FlashCard 加状态按钮；CardGrid 加状态角标；KanbanVault 加状态过滤；PracticeHub 实现默写模式；i18n 补文案
- 数据：vault.json 字段增量兼容，旧数据 status 默认 unreviewed

### 无风险点
- status 字段可选，旧数据读取时 undefined 视为 unreviewed，完全向下兼容
- PATCH 接口幂等，重复调用安全

---

## 后端改动

### 新增 PATCH /api/vault/:id
```js
// 更新单条记录的指定字段（目前只用于更新 status）
router.patch('/:id', async (req, res) => {
  const { status } = req.body
  // 合法值校验 + 调用 updateItem
})
```

### storage.js 新增 updateItem
```js
export async function updateItem(id, patch) {
  // mutex 保护，读 → 找到 item → 合并 patch → 写回
}
```

---

## 前端改动

### 1. api/client.js
```js
export const updateItem = (id, patch) => api.patch(`/vault/${id}`, patch).then(r => r.data)
```

### 2. hooks/useVault.js
新增 `updateItem` callback，乐观更新本地 vault state

### 3. FlashCard.jsx
底部操作栏新增 StatusButton 组件：
- unreviewed → 点击 → reviewing（🔁 橙）
- reviewing  → 点击 → mastered（✅ 绿）
- mastered   → 点击 → unreviewed（⬜ 灰）

### 4. CardGrid.jsx / GridCell
左上角加状态角标（reviewing=橙点，mastered=绿勾）

### 5. KanbanVault.jsx
搜索框右侧加状态 select 过滤器，联动 currentCards 过滤逻辑

### 6. PracticeHub.jsx
实现默写模式：
- DictationMode 组件，接收 vault prop
- 内部状态：currentCard / userInput / revealed / result
- 评分函数 scoreAnswer(input, answer)

### 7. i18n.js
补充 status、dictation 相关文案（中英双语）

---

## 实现顺序
1. 后端 updateItem + PATCH 路由
2. 前端 api + hook 层
3. FlashCard 状态按钮
4. CardGrid 状态角标 + KanbanVault 状态过滤
5. PracticeHub 默写模式
6. i18n 文案收尾
