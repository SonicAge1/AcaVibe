export const LANGS = {
  zh: {
    // App / Header
    appName: 'AcaVibe',
    appDesc: '学术表达自动化看板',

    // ExtractorPanel
    extractorTitle: '学术骨架摘录器',
    extractorDesc: '将文献长句泛化为可复用的填空模板',
    intentLabel: '学术意图',
    intentRequired: '（必选）',
    sourceLabel: '原文段落',
    sourcePlaceholder: '粘贴文献原文段落...',
    extractBtn: '提取骨架',
    extracting: '生成中...',
    resetTitle: '重置',
    skeletonResultLabel: '句式骨架',
    hintResultLabel: '用法提示',
    saveBtn: '保存到看板',
    saving: '保存中...',
    saved: '✓ 已保存到看板',
    errNoText: '请粘贴原文段落',
    errNoIntent: '请选择学术意图',
    errAI: 'AI 处理失败，请稍后重试',
    errSave: '保存失败，请重试',

    // VibeTranslator
    translatorTitle: '白话学术化翻译机',
    translatorDesc: '大白话一键升维为地道学术表达',
    inputLabel: '大白话输入',
    inputPlaceholder: '如：super detailed、研究得很透彻...',
    translateBtn: '翻译',
    translating: '生成中...',
    candidatesLabel: '选择最合适的候选词：',
    selectedMark: '已选择',
    intentClassifyLabel: '归类到学术意图',
    errNoInput: '请输入要转化的大白话',

    // KanbanVault
    vaultTitle: '意图词库',
    skeletonType: '句式骨架',
    wordType: '学术词汇',
    sourceBtn: '查看原文溯源',
    copyBtn: '复制内容',
    copied: '已复制',
    deleteTitle: '移出词库',
    emptyTitle: (intent, label) => `「${intent}」下还没有${label}`,
    emptySkeletonHint: '用「学术骨架摘录器」生成句式并保存',
    emptyWordHint: '用「白话学术化翻译机」生成词汇并保存',
    loading: '加载中...',

    // Intents
    intents: {
      '对比差异': '对比差异',
      '提出反驳': '提出反驳',
      '说明演进': '说明演进',
      '引入背景': '引入背景',
      '得出结论': '得出结论',
      '描述特征': '描述特征',
    },
  },

  en: {
    // App / Header
    appName: 'AcaVibe',
    appDesc: 'Academic Expression Automation Board',

    // ExtractorPanel
    extractorTitle: 'Skeleton Extractor',
    extractorDesc: 'Turn literature sentences into reusable fill-in-the-blank templates',
    intentLabel: 'Writing Intent',
    intentRequired: '(required)',
    sourceLabel: 'Source Paragraph',
    sourcePlaceholder: 'Paste the original literature paragraph here...',
    extractBtn: 'Extract Skeleton',
    extracting: 'Generating...',
    resetTitle: 'Reset',
    skeletonResultLabel: 'Sentence Skeleton',
    hintResultLabel: 'Usage Hint',
    saveBtn: 'Save to Board',
    saving: 'Saving...',
    saved: '✓ Saved to Board',
    errNoText: 'Please paste a source paragraph',
    errNoIntent: 'Please select a writing intent',
    errAI: 'AI processing failed, please try again',
    errSave: 'Save failed, please retry',

    // VibeTranslator
    translatorTitle: 'Vibe Translator',
    translatorDesc: 'Upgrade casual expressions to formal academic language',
    inputLabel: 'Casual Input',
    inputPlaceholder: 'e.g. super detailed, did a deep dive...',
    translateBtn: 'Translate',
    translating: 'Generating...',
    candidatesLabel: 'Pick the best candidate:',
    selectedMark: 'Selected',
    intentClassifyLabel: 'Classify into Writing Intent',
    errNoInput: 'Please enter an expression to translate',

    // KanbanVault
    vaultTitle: 'Intent Vault',
    skeletonType: 'Skeletons',
    wordType: 'Vocabulary',
    sourceBtn: 'View Source',
    copyBtn: 'Copy',
    copied: 'Copied!',
    deleteTitle: 'Remove',
    emptyTitle: (intent, label) => `No ${label} under "${intent}" yet`,
    emptySkeletonHint: 'Use the Skeleton Extractor to generate and save one ✨',
    emptyWordHint: 'Use the Vibe Translator to generate and save one ✨',
    loading: 'Loading...',

    // Intents (English labels shown in EN mode)
    intents: {
      '对比差异': 'Contrast',
      '提出反驳': 'Rebuttal',
      '说明演进': 'Evolution',
      '引入背景': 'Background',
      '得出结论': 'Conclusion',
      '描述特征': 'Description',
    },
  },
}
