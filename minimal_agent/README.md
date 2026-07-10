# Minimal Coding Agent - 第一节课

根据AI Agent教程要求，这是每个学习者的**第一节课**：手写一个最小的Coding Agent。

## 🎯 教程要求

教程明确指出：
> "你要自己手写一个自己的一个minimum的coding agent，自己最小的一个agent要让他来写出来，而且要跑出来。"

> "最小版本的SW agent是什么？是每个大学生，计算机系大学生AI专业大学生的第一节课。"

## 🏗️ 最小Agent的核心功能

教程强调，最小的agent只需要两个核心功能：

### 1. Terminal执行
```javascript
// 执行shell命令并获取输出
const { success, output } = agent.executeCommand("ls -la");
```

### 2. 文件IO读写
```javascript
// 读取文件
const { success, content } = agent.readFile("test.txt");

// 写入文件
const { success, message } = agent.writeFile("output.txt", "Hello World");
```

## 🚀 如何使用

### 运行Agent（JavaScript版本）
```bash
cd minimal_agent
node agent.js
```

### 运行Agent（Python版本 - 需要Python环境）
```bash
cd minimal_agent
python agent.py
```

### 交互命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `exec <command>` | 执行shell命令 | `exec ls -la` |
| `read <file>` | 读取文件内容 | `read test.txt` |
| `write <file>` | 写入文件内容 | `write output.txt` |
| `history` | 查看操作历史 | `history` |
| `quit` | 退出程序 | `quit` |

### 示例会话

```
🤖 Agent> exec echo "Hello, Agent!"
✅ 成功！
Hello, Agent!

🤖 Agent> write test.txt
请输入内容（输入END结束）：
This is a test file.
Created by Minimal Agent.
END
✅ Successfully wrote to test.txt

🤖 Agent> read test.txt
✅ 文件内容：
This is a test file.
Created by Minimal Agent.

🤖 Agent> exec dir
✅ 成功！
 Volume in drive C is Windows
 Directory of C:\Users\20300\Desktop\AI-Agent-Study\minimal_agent

2026/07/10  19:42    <DIR>          .
2026/07/10  19:42    <DIR>          ..
2026/07/10  19:45             1,234 agent.js
2026/07/10  19:42             2,345 agent.py
2026/07/10  19:45             1,567 README.md
2026/07/10  19:45                45 test.txt
               3 File(s)          5,191 bytes
               2 Dir(s)  123,456,789,012 bytes free

🤖 Agent> history
📋 操作历史：
  1. EXECUTE: echo "Hello, Agent!"
  2. WRITE: test.txt
  3. READ: test.txt
  4. EXECUTE: dir
```

## 📚 学习要点

### 1. 理解Agent的核心循环
```
用户输入 -> 解析意图 -> 执行操作 -> 返回结果
```

### 2. 掌握两个基础能力
- **命令执行**：与操作系统交互
- **文件IO**：读写数据和代码

### 3. 为什么这是第一节课？
教程解释：
> "把这些核心功能首先是看懂，第二是想明白，设计明白，第三是把它实现出来。把这三步实现完了之后，你就是一个合格的一个在agent领域里面入门的一个大学生。"

## 🔧 代码结构

```
minimal_agent/
├── agent.js      # JavaScript版本（推荐）
├── agent.py      # Python版本
└── README.md     # 本说明文件
```

### MinimalCodingAgent类

```javascript
class MinimalCodingAgent {
    executeCommand(command)    // 核心功能1：执行命令
    readFile(filePath)        // 核心功能2：读取文件
    writeFile(filePath, content)  // 核心功能2：写入文件
    getHistory()               // 辅助：获取历史记录
    clearHistory()             // 辅助：清空历史
}
```

## 🎓 下一步学习

完成这个最小agent后，你可以：

### 1. 扩展功能（参考教程）
- **Plan mode**：让agent制定计划再执行
- **Memory系统**：实现长期记忆
- **Multi-agent支持**：多个agent协作
- **Context auto compression**：自动压缩上下文

### 2. 学习现代Agent
- 研究Claude Code、Codex等开源实现
- 理解TUI设计
- 学习Sandbox环境控制

### 3. 深入Multi-agent
- 了解正确的使用场景（大规模并行任务）
- 避免常见陷阱（公司架构模拟）

## 💡 教程提醒

> "你要和看一看和今天最好的这些开源的实现你有哪些差距。"

> "从马车蒸汽汽车开始，你已经实现了第一节课。你要和看一看和今天最好的这些开源的实现你有哪些差距。"

## 🚀 快速开始

1. 确保安装了Node.js（v14+）或Python（3.6+）
2. 进入minimal_agent目录
3. 运行`node agent.js`（推荐）或`python agent.py`
4. 尝试各种命令，理解agent的工作原理

---

*这是AI Agent学习的第一步。完成它，你就入门了！*
