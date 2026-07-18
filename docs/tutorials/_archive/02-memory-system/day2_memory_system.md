# Memory 系统完整实现指南

> 基于 `memory.js` 的逐行解析，从零实现一个完整的 Agent 记忆系统

---

## 1. 为什么需要 Memory？

没有 Memory 的 Agent 每次对话都是"失忆"的：

```
用户：我叫张三
Agent：你好张三！
（下次对话）
用户：我叫什么？
Agent：我不知道你是谁 ❌
```

有 Memory 的 Agent：

```
用户：我叫张三
Agent：你好张三！（记住：user_name = 张三）
（下次对话）
用户：我叫什么？
Agent：你叫张三！ ✅
```

---

## 2. 两种记忆类型

### 2.1 短期记忆（Short-term Memory）

| 属性 | 说明 |
|------|------|
| 存储位置 | 内存（数组） |
| 生命周期 | 会话结束即丢失 |
| 用途 | 当前对话上下文 |
| 最大容量 | 50 条消息（FIFO 淘汰） |

**工作原理**：消息以 FIFO 队列形式存储在数组中，超出容量时自动删除最旧消息。

```javascript
class ShortTermMemory {
    constructor(maxMessages = 50) {
        this.messages = [];
        this.maxMessages = maxMessages;
    }

    addMessage(role, content) {
        this.messages.push({
            role, content, timestamp: Date.now()
        });
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
    }

    getRecentMessages(n = 10) {
        return this.messages.slice(-n);
    }

    search(keyword) {
        return this.messages.filter(msg =>
            msg.content.toLowerCase().includes(keyword.toLowerCase())
        );
    }
}
```

### 2.2 长期记忆（Long-term Memory）

| 属性 | 说明 |
|------|------|
| 存储位置 | 文件（memory.json） |
| 生命周期 | 永久保存 |
| 用途 | 用户偏好、跨会话知识 |

**数据结构**：

```json
{
  "userPreferences": {
    "name": "张三",
    "language": "zh",
    "theme": "dark"
  },
  "learnedKnowledge": [],
  "projectInfo": {}
}
```

**核心实现**：

```javascript
class LongTermMemory {
    constructor(filePath = 'memory.json') {
        this.filePath = path.resolve(filePath);
        this.data = this._load();
    }

    _load() {
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, 'utf-8');
                return JSON.parse(raw);
            }
        } catch (e) {
            console.error('[长期记忆] 加载失败:', e.message);
        }
        return { userPreferences: {}, learnedKnowledge: [], projectInfo: {} };
    }

    _save() {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
        } catch (e) {
            console.error('[长期记忆] 保存失败:', e.message);
        }
    }

    remember(key, value) {
        this.data.userPreferences[key] = value;
        this._save();
    }

    recall(key) {
        return this.data.userPreferences[key];
    }

    forget(key) {
        delete this.data.userPreferences[key];
        this._save();
    }
}
```

---

## 3. Agent 集成

将 Memory 系统集成到 Agent 中：

```javascript
class Agent {
    constructor() {
        this.memory = {
            shortTerm: new ShortTermMemory(50),
            longTerm: new LongTermMemory('memory.json')
        };
    }

    async process(input) {
        // 1. 自动学习用户信息
        this._autoLearn(input);
        // 2. 添加到短期记忆
        this.memory.shortTerm.addMessage('user', input);
        // 3. 获取上下文
        const context = this.memory.shortTerm.getContext();
        // 4. 生成回复（略）
        const reply = await this._generateReply(input, context);
        // 5. 保存到短期记忆
        this.memory.shortTerm.addMessage('assistant', reply);
        return reply;
    }
}
```

---

## 4. 信息提取（正则表达式）

从对话中自动提取用户信息：

| 模式 | 示例 | 提取结果 |
|------|------|----------|
| 我叫xxx | 我叫张三 | name = 张三 |
| 我是xxx | 我是李四 | name = 李四 |
| 我喜欢xxx | 我喜欢编程 | preference = 编程 |
| 我今年N岁 | 我今年25岁 | age = 25 |
| 我住在xxx | 我住在北京 | location = 北京 |

**提取算法**：

```javascript
const PATTERNS = [
    { key: 'name', regex: /我[叫是](.{1,10})[，。！？\s]?/ },
    { key: 'preference', regex: /我喜欢(.{1,20})[，。！？\s]?/ },
    { key: 'age', regex: /我今年(\d+)岁/ },
    { key: 'location', regex: /我住在(.{1,10})[，。！？\s]?/ },
];

function extractInfo(text) {
    for (const pattern of PATTERNS) {
        const match = text.match(pattern.regex);
        if (match && match[1]) {
            return { key: pattern.key, value: match[1].trim() };
        }
    }
    return null;
}
```

---

## 5. 语言识别

### 自然语言检测

```javascript
function detectLanguage(text) {
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const ratio = chineseChars / text.length;
    return ratio > 0.3 ? 'zh' : 'en';
}
```

### 编程语言检测

```javascript
const LANGUAGE_MAP = {
    '.js': 'javascript', '.ts': 'typescript',
    '.py': 'python', '.java': 'java',
};

function detectCodeLanguage(filename) {
    const ext = path.extname(filename).toLowerCase();
    return LANGUAGE_MAP[ext] || 'unknown';
}
```

---

## 6. 完整使用示例

```javascript
// 1. 初始化
const agent = new Agent();

// 2. 第一次对话
await agent.process('我叫张三，我喜欢Python');
// 长期记忆：{ name: "张三", preference: "Python" }

// 3. 第二次对话（新会话）
await agent.process('我叫什么名字？');
// 短期记忆：["我叫张三，我喜欢Python", "我叫什么名字？"]
// 长期记忆召回：name = 张三
// 回复："你叫张三，你喜欢Python！"
```

---

## 7. 最佳实践

1. **短期记忆容量**：建议 30-50 条消息
2. **长期记忆持久化**：每次修改立即保存到文件
3. **信息提取**：正则表达式可扩展
4. **隐私保护**：支持 forget() 方法
5. **错误处理**：文件读写添加 try-catch

---

## 参考代码

- [memory.js](/minimal_agent/memory.js) -- 完整实现
- [agent_v2.js](/minimal_agent/agent_v2.js) -- 集成示例
- [test_memory.js](/minimal_agent/tests/test_memory.js) -- 测试用例
