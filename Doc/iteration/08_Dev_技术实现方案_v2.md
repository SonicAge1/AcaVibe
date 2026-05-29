# Dev · 技术实现方案 v2

## 改动范围
- 后端：新增 DELETE /api/vault/batch（批量删除）
- 前端：CardGrid 加多选；KanbanVault 加排序 + 批量操作栏；App.jsx + ExtractorPanel/VibeTranslator 加跳转

## 实现顺序
1. 后端 batch delete 接口
2. storage.js 新增 deleteItems（批量）
3. api/client.js 新增 removeItems
4. CardGrid 多选模式
5. KanbanVault 排序 + 批量操作栏
6. App.jsx onGoVault + ExtractorPanel/VibeTranslator 保存跳转
