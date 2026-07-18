 # Harness 的核心设计
 
 设计一个 Harness 时，真正需要解决的只有几个问题。社区里几个主流方案（Codex CLI、LangChain、LangGraph）给出了不同的答案，但底层的权衡是相似的。
 
 ## 1. 状态管理：有状态 vs 无状态
 
 | | 有状态 | 无状态 |
 |---|---|---|
 | 做法 | Harness 维护一个消息列表，每次循环追加 | 每次调用完整传上下文 |
 | 优点 | 简单直观，模型能看到完整历史 | 天然支持分布式、断点续跑 |
 | 缺点 | 内存占用随轮次增长 | 传输成本高，实现复杂 |
 | 典型代表 | Codex CLI、AutoGPT | LangGraph（StateGraph） |
 
 大多数 Agent 框架会选择**有状态**模式——维护一个中央消息列表，每轮追加。这跟人类思维一致：你不需要每次重新读一遍之前所有的聊天记录。
 
 ## 2. 安全边界：Sandbox
 
 既然 Harness 允许模型执行真实操作，安全就是硬需求。常见的安全设计：
 
 **命令白名单/黑名单**
 
 ```javascript
 // Codex CLI 风格：只允许特定的危险命令
 const ALLOWED_COMMANDS = ['ls', 'cat', 'node', 'git'];
 const BLOCKED_COMMANDS = ['rm -rf', 'sudo', 'chmod'];
 ```
 
 **文件系统隔离**
 
 - 限制模型只能读写工作目录下的文件
 - 禁止访问 `/etc/passwd`、`~/.ssh` 等敏感路径
 - 可以结合 Sandbox 做真正的进程隔离
 
 **确认步骤（Human-in-the-loop）**
 
 - 执行危险命令前需要用户确认
 - 写入文件时显示 diff
 - 允许用户取消正在执行的操作
 
 你的 `agent_v2.js` 中已经实现了基本的命令白名单机制。
 
 ## 3. 可观测性：看不见的循环怎么调试
 
 Harness 最大的问题之一是**黑盒性**——几十轮循环里模型到底在想什么？每一步发生了什么？
 
 好的 Harness 会暴露这些信息：
 
 - **Logging**：每一步的输入、输出、耗时
 - **Tracing**：完整的调用链（"模型说要读文件 → 读了 xxx → 模型说要编辑 → 编辑了 yyy"）
 - **状态快照**：当前上下文大小、已用 token 数、已执行轮次
 - **断点**：允许暂停执行、检查状态、修改后再继续
 
 ```javascript
 // 一个简单的 trace
 {
   step: 7,
   model: "claude-sonnet-4",
   think: "用户想要修改 Calculator 类的 add 方法",
   act: { tool: "edit_file", target: "src/calc.js", change: "+ this.add(a,b)" },
   observe: { status: "ok", tokens_used: 3456 },
   duration_ms: 3200
 }
 ```
 
 ## 4. 错误恢复：模型也会犯错
 
 模型在循环中可能犯各种错误：
 
 - **格式错误**：Tool Call 的 JSON 格式不对
 - **幻觉参数**：调用了一个不存在的工具
 - **超时卡住**：模型在某个问题上反复兜圈子
 - **上下文溢出**：总 tokens 超过了模型限制
 
 Harness 的处理策略：
 
 ```javascript
 try {
   const toolCall = JSON.parse(modelOutput);
   await execute(toolCall);
 } catch (e) {
   // 把错误信息当成 tool result 返回给模型
   messages.push({
     role: 'tool',
     content: `执行失败: ${e.message}，请重试或换一种方式。`
   });
   // 让模型自己修正
 }
 ```
 
 **关键原则：Harness 不自己纠正模型的错误，而是把错误作为观察结果还给模型，让模型自己改正。** 这样保持了"模型负责推理、Harness 负责执行"的边界。
 
 ## 5. 扩展性：插件和工具注册
 
 一个可扩展的 Harness 需要一个工具注册表：
 
 ```javascript
 class ToolRegistry {
   tools = new Map();
 
   register(name, handler, schema) {
     this.tools.set(name, { handler, schema });
     // schema 会被注入到 system prompt 中
   }
 
   async execute(name, args) {
     const tool = this.tools.get(name);
     if (!tool) throw new Error(`Unknown tool: ${name}`);
     return await tool.handler(args);
   }
 }
 ```
 
 这也是 MCP（Model Context Protocol）的用武之地——让 Harness 能动态发现和注册工具，而不是硬编码。
 
 ---
 
 [下一章：Codex CLI 中的 Harness →](04-harness-in-codex.md)
