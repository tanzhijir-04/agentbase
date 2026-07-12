# 🤖 Agent v2.0 功能说明

> **版本**: v2.0
> **更新日期**: 2026年7月12日
> **新增功能**: Memory系统、语言识别

---

## 📋 版本对比

| 功能 | v1.0 | v2.0 |
|------|------|------|
| 执行命令 | ✅ | ✅ |
| 读写文件 | ✅ | ✅ |
| Plan Mode | ✅ | ✅ |
| **Memory系统** | ❌ | ✅ 新增 |
| **语言识别** | ❌ | ✅ 新增 |
| **自动学习** | ❌ | ✅ 新增 |

---

## 🧠 Memory系统特性

### 1. 短期记忆（Session Memory）

**作用**: 记住当前对话的历史

```javascript
// 内部实现
this.memory.shortTerm.addMessage('user', '你好');
this.memory.shortTerm.addMessage('assistant', '你好！有什么可以帮助你的？');

// 最多保存50条消息，超出时自动删除最旧的
```

**特性**:
- 会话期间有效
- 自动FIFO管理（超出容量删除最旧）
- 支持关键词搜索

### 2. 长期记忆（Long-term Memory）

**作用**: 跨会话记住用户信息

```javascript
// 保存到 memory.json 文件
this.memory.longTerm.remember('name', '张三');
this.memory.longTerm.recall('name');  // → '张三'
```

**数据结构**:
```json
{
  "userPreferences": {
    "name": "张三",
    "language": "中文",
    "hobby": "编程"
  },
  "learnedKnowledge": [],
  "projectInfo": {}
}
```

### 3. 自动学习

**作用**: 从用户对话中自动提取信息

```javascript
// 用户说：我叫张三，我喜欢Python
// Agent自动提取：
// - name = 张三
// - preference = Python
```

**支持的提取模式**:
| 模式 | 示例 | 提取结果 |
|------|------|----------|
| `我叫xxx` | 我叫张三 | name = 张三 |
| `我是xxx` | 我是李四 | name = 李四 |
| `我喜欢xxx` | 我喜欢编程 | preference = 编程 |
| `我今年N岁` | 我今年25岁 | age = 25 |
| `我住在xxx` | 我住在北京 | location = 北京 |

---

## 🌐 语言识别特性

### 1. 自然语言检测（中文/英文）

**原理**: 计算中文字符在文本中的比例

```javascript
const chineseRatio = chineseCount / totalChars;
return chineseRatio > 0.3 ? 'zh' : 'en';
```

**测试结果**:
```
"Hello, how are you?"           → 英文 (100%)
"你好，世界！"                   → 中文 (100%)
"我叫张三，I am a programmer."  → 中文 (78%)
```

### 2. 编程语言检测（基于文件扩展名）

**原理**: 使用扩展名映射表

```javascript
const LANGUAGE_MAP = {
  '.js': 'javascript',
  '.ts': 'typescript',
  '.py': 'python',
  '.java': 'java',
  // ...
};
```

**测试结果**:
```
agent.js      → javascript
memory.py     → python
app.tsx       → typescript
README.md     → markdown
```

---

## 📁 文件结构

```
minimal_agent/
├── agent_v2.js           # Agent v2.0（含Memory）
├── memory.js             # Memory系统实现
├── agent.js              # Agent v1.0（基础版）
├── plan_mode.js          # Plan Mode
├── test_agent_v2.js      # v2.0测试脚本
├── test_memory.js        # Memory测试脚本
├── demo_regex.js         # 正则表达式演示
├── demo_language_detection.js  # 语言检测演示
└── memory.json           # 长期记忆存储文件
```

---

## 🎮 使用指南

### 启动Agent

```bash
cd minimal_agent
node agent_v2.js
```

### Memory命令

```bash
# 记住信息
🤖 Agent> remember name 张三
✅ 已记住: name = 张三

# 回忆信息
🤖 Agent> recall name
📝 name = 张三

# 忘记信息
🤖 Agent> forget name
🗑️ 已忘记: name

# 查看所有记忆
🤖 Agent> memory

# 智能对话（自动学习）
🤖 Agent> chat 我叫李四，我喜欢Python
✅ 我记住了：
   名字: 李四
   偏好: Python
💬 收到你的消息（中文）：我叫李四，我喜欢Python
```

### 语言识别命令

```bash
# 检测自然语言
🤖 Agent> lang 你好世界
🗣️ 语言: 中文 (置信度: 1)

# 检测编程语言
🤖 Agent> lang --file agent.js
📄 文件 "agent.js" 的编程语言: javascript
```

---

## 🔧 技术实现

### Memory类结构

```
MemoryManager
├── ShortTermMemory (短期记忆)
│   ├── messages[]          # 消息数组
│   ├── maxMessages = 50    # 最大容量
│   ├── addMessage()        # 添加消息
│   ├── getContext()        # 获取所有消息
│   └── search()            # 搜索消息
│
└── LongTermMemory (长期记忆)
    ├── memory.userPreferences  # 用户偏好
    ├── memory.learnedKnowledge # 学到的知识
    ├── remember()              # 记住
    ├── recall()                # 回忆
    └── save()                  # 保存到文件
```

### 语言检测类结构

```
LanguageDetector
├── LANGUAGE_MAP              # 扩展名映射表
├── detectFileLanguage()      # 检测文件编程语言
├── detectNaturalLanguage()   # 检测自然语言
└── detectProgrammingLanguage() # 检测代码内容语言
```

---

## 💡 使用场景

### 场景1：记住用户信息

```
用户: 我叫张三，是一个Python开发者
Agent: ✅ 我记住了！名字: 张三，偏好: Python开发者

（下次对话）
用户: 我叫什么？
Agent: 你叫张三！
```

### 场景2：智能语言切换

```
用户: 你好
Agent: (检测到中文) 你好！有什么可以帮助你的？

用户: Hello
Agent: (检测到英文) Hello! How can I help you?
```

### 场景3：项目记忆

```
# 创建 CLAUDE.md
用户: 请记住这个项目使用TypeScript
Agent: ✅ 已保存到项目记忆

# 下次启动
Agent: (读取CLAUDE.md) 检测到项目使用TypeScript...
```

---

## 🎯 下一步计划

- [ ] 实现上下文压缩（Context Compression）
- [ ] 添加循环检测（Loop Detection）
- [ ] 支持更复杂的信息提取（使用LLM）
- [ ] 添加记忆遗忘机制
- [ ] 支持对话摘要

---

*更新时间：2026年7月12日*
