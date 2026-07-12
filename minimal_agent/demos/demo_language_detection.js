/**
 * 语言检测示例
 * 
 * 演示Codex如何识别：
 * 1. 编程语言（基于文件扩展名）
 * 2. 自然语言（中文/英文）
 * 3. 代码内容检测
 */

const path = require('path');

// ============ 1. 编程语言检测 ============
console.log('📚 第一部分：编程语言检测（基于文件扩展名）');
console.log('─'.repeat(50));

// Codex中的语言映射表
const LANGUAGE_MAP = {
  // JavaScript/TypeScript
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  
  // Python
  '.py': 'python',
  '.pyw': 'python',
  
  // 其他语言
  '.java': 'java',
  '.go': 'go',
  '.rs': 'rust',
  '.rb': 'ruby',
  '.php': 'php',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c-header',
  '.cs': 'csharp',
  '.swift': 'swift',
  '.kt': 'kotlin',
  
  // 配置文件
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.xml': 'xml',
  '.html': 'html',
  '.css': 'css',
  
  // 文档
  '.md': 'markdown',
  '.txt': 'plaintext',
  
  // Shell
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'zsh',
  '.ps1': 'powershell',
  '.bat': 'batch',
};

function detectFileLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return LANGUAGE_MAP[ext] || 'unknown';
}

// 测试文件语言检测
const testFiles = [
  'agent.js',
  'memory.py',
  'app.tsx',
  'style.css',
  'README.md',
  'config.json',
  'setup.ps1',
  'unknown.xyz'
];

testFiles.forEach(file => {
  const lang = detectFileLanguage(file);
  console.log(`  ${file.padEnd(20)} → ${lang}`);
});

// ============ 2. 自然语言检测 ============
console.log('\n\n📚 第二部分：自然语言检测（中文/英文）');
console.log('─'.repeat(50));

/**
 * 检测自然语言
 * 原理：计算中文字符在文本中的比例
 */
function detectNaturalLanguage(text) {
  // 中文字符Unicode范围
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf]/g;
  
  // 统计中文字符数量
  const chineseChars = text.match(chineseRegex);
  const chineseCount = chineseChars ? chineseChars.length : 0;
  
  // 计算中文字符比例（忽略空格和标点）
  const cleanText = text.replace(/[\s\p{P}]/gu, '');
  const totalChars = cleanText.length;
  
  const chineseRatio = totalChars > 0 ? chineseCount / totalChars : 0;
  
  // 判断语言
  let lang, confidence;
  
  if (chineseRatio > 0.5) {
    lang = 'zh';
    confidence = Math.min(0.5 + chineseRatio, 1.0);
  } else if (chineseRatio > 0.1) {
    lang = 'zh';  // 可能是中英混合
    confidence = 0.5 + chineseRatio;
  } else {
    lang = 'en';
    confidence = 1.0 - chineseRatio;
  }
  
  return {
    lang,
    confidence: Math.round(confidence * 100) / 100,
    chineseRatio: Math.round(chineseRatio * 100) / 100,
    chineseCount,
    totalChars
  };
}

// 测试自然语言检测
const testTexts = [
  "Hello, how are you?",
  "你好，世界！",
  "我叫张三，I am a programmer.",
  "Today is a good day. 今天天气很好。",
  "The quick brown fox jumps over the lazy dog.",
  "人工智能正在改变世界，AI is transforming the world."
];

testTexts.forEach(text => {
  const result = detectNaturalLanguage(text);
  console.log(`\n  文本: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
  console.log(`  语言: ${result.lang} (置信度: ${result.confidence})`);
  console.log(`  中文比例: ${result.chineseRatio} (${result.chineseCount}/${result.totalChars}字符)`);
});

// ============ 3. 代码内容检测 ============
console.log('\n\n📚 第三部分：代码内容检测');
console.log('─'.repeat(50));

/**
 * 检测内容是否是代码
 */
function hasCodePatterns(content) {
  const codePatterns = [
    { regex: /function\s+\w+\s*\(/, name: 'function声明' },
    { regex: /class\s+\w+/, name: 'class声明' },
    { regex: /const\s+\w+\s*=/, name: 'const赋值' },
    { regex: /import\s+.*from/, name: 'import语句' },
    { regex: /require\s*\(/, name: 'require调用' },
    { regex: /def\s+\w+\s*\(/, name: 'Python def' },
    { regex: /print\s*\(/, name: 'print调用' },
    { regex: /if\s*\(.+\)\s*\{/, name: 'if语句' },
    { regex: /for\s*\(.+\)\s*\{/, name: 'for循环' },
    { regex: /=>\s*\{/, name: '箭头函数' }
  ];
  
  const found = [];
  
  for (const pattern of codePatterns) {
    if (pattern.regex.test(content)) {
      found.push(pattern.name);
    }
  }
  
  return found;
}

/**
 * 检测编程语言（基于内容）
 */
function detectProgrammingLanguage(content) {
  const patterns = {
    javascript: [
      { regex: /function\s+\w+\s*\(/, score: 10 },
      { regex: /const\s+\w+\s*=/, score: 10 },
      { regex: /let\s+\w+\s*=/, score: 10 },
      { regex: /=>\s*\{/, score: 15 },
      { regex: /console\.log/, score: 20 },
      { regex: /require\s*\(/, score: 15 },
      { regex: /import\s+.*from/, score: 15 }
    ],
    python: [
      { regex: /def\s+\w+\s*\(/, score: 15 },
      { regex: /class\s+\w+/, score: 10 },
      { regex: /print\s*\(/, score: 10 },
      { regex: /import\s+\w+/, score: 10 },
      { regex: /self\.\w+/, score: 20 },
      { regex: /elif\s+/, score: 15 }
    ],
    typescript: [
      { regex: /:\s*(string|number|boolean|any)/, score: 15 },
      { regex: /interface\s+\w+/, score: 20 },
      { regex: /type\s+\w+\s*=/, score: 20 },
      { regex: /<\w+>/, score: 5 }
    ],
    java: [
      { regex: /public\s+class/, score: 20 },
      { regex: /private\s+\w+\s+\w+/, score: 15 },
      { regex: /System\.out\.print/, score: 20 },
      { regex: /public\s+static\s+void/, score: 20 }
    ]
  };
  
  const scores = {};
  
  for (const [lang, langPatterns] of Object.entries(patterns)) {
    scores[lang] = 0;
    for (const pattern of langPatterns) {
      if (pattern.regex.test(content)) {
        scores[lang] += pattern.score;
      }
    }
  }
  
  // 找到最高分的语言
  let maxScore = 0;
  let detectedLang = 'unknown';
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }
  
  return {
    language: detectedLang,
    scores,
    confidence: maxScore > 0 ? Math.min(maxScore / 50, 1.0) : 0
  };
}

// 测试代码检测
const testCodes = [
  {
    name: 'JavaScript函数',
    content: `
function greet(name) {
  console.log("Hello, " + name);
  return true;
}
const result = greet("World");
    `
  },
  {
    name: 'Python类',
    content: `
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        print(f"{self.name} makes a sound")
    `
  },
  {
    name: 'TypeScript接口',
    content: `
interface User {
  name: string;
  age: number;
  email?: string;
}

function getUser(id: number): User {
  return { name: "John", age: 25 };
}
    `
  }
];

testCodes.forEach(test => {
  console.log(`\n  ${test.name}:`);
  
  // 检测是否是代码
  const codePatterns = hasCodePatterns(test.content);
  console.log(`  代码特征: ${codePatterns.join(', ')}`);
  
  // 检测编程语言
  const result = detectProgrammingLanguage(test.content);
  console.log(`  检测语言: ${result.language} (置信度: ${result.confidence})`);
  console.log(`  各语言得分:`, result.scores);
});

// ============ 4. 综合示例 ============
console.log('\n\n📚 第四部分：综合示例');
console.log('─'.repeat(50));

/**
 * 完整的语言检测流程
 */
function analyzeInput(input, filePath = null) {
  const result = {
    input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
    fileType: null,
    naturalLanguage: null,
    codeLanguage: null,
    hasCode: false
  };
  
  // 1. 如果有文件路径，检测文件类型
  if (filePath) {
    result.fileType = detectFileLanguage(filePath);
  }
  
  // 2. 检测是否包含代码
  const codePatterns = hasCodePatterns(input);
  result.hasCode = codePatterns.length > 0;
  
  // 3. 如果是代码，检测编程语言
  if (result.hasCode) {
    const codeResult = detectProgrammingLanguage(input);
    result.codeLanguage = codeResult.language;
  } else {
    // 4. 如果不是代码，检测自然语言
    result.naturalLanguage = detectNaturalLanguage(input);
  }
  
  return result;
}

// 测试综合分析
const comprehensiveTests = [
  { input: "帮我修改 agent.js 文件", file: "agent.js" },
  { input: "function add(a, b) { return a + b; }" },
  { input: "你好，我想学习编程" },
  { input: "Hello, I want to learn coding" },
  { input: "def calculate_sum(numbers): return sum(numbers)" }
];

comprehensiveTests.forEach(test => {
  console.log(`\n输入: "${test.input}"`);
  if (test.file) console.log(`文件: ${test.file}`);
  
  const result = analyzeInput(test.input, test.file);
  
  if (result.fileType) console.log(`  文件类型: ${result.fileType}`);
  if (result.hasCode) console.log(`  包含代码: 是 (检测为 ${result.codeLanguage})`);
  if (result.naturalLanguage) {
    console.log(`  自然语言: ${result.naturalLanguage.lang} (置信度: ${result.naturalLanguage.confidence})`);
  }
});

console.log('\n🎉 语言检测演示完成！');
