 # Harness 的工作原理
 
 ## 核心循环：Think → Act → Observe
 
 几乎所有 Agent Harness 的核心都是同一个循环：
 
 ```
   ┌──────────────┐
   │  1. Think     │  模型处理当前上下文，决定下一步动作
   └──────┬───────┘
          │ 输出：文本 或 Tool Call
          ▼
   ┌──────────────┐
   │  2. Parse     │  Harness 解析输出，区分"说话"还是"调用工具"
   └──────┬───────┘
          │
          ├── 如果是文本 → 返回给用户，循环结束
          │
          ▼
   ┌──────────────┐
   │  3. Act       │  Harness 执行工具（终端命令/读文件/调API）
   └──────┬───────┘
          │ 输出：执行结果
          ▼
   ┌──────────────┐
   │  4. Observe   │  把结果追加到上下文，告诉模型"刚发生了什么"
   └──────┬───────┘
          │
          └──→ 回到 1. Think（继续循环）
 ```
 
 这就是所谓 **ReAct 模式**（Reasoning + Acting）。Codex CLI、LangChain Agent、AutoGPT 全都是这个骨架的变体。
 
 ## 接口视角：Harness 暴露了什么
 
 从使用者的角度看，Harness 把多轮交互压缩成一个函数调用：
 
 ```
 // 普通聊天接口
 function chat(prompt: string) → string
 
 // Harness 接口
 function run(task: string) → TaskResult
 ```
 
 前者只返回一段文字。后者在背后做了无数次 think-act-observe 循环、调了十几个工具、写了几个文件、打开过浏览器——但使用者只看到一个结果。
 
 ## 上下文管理：Harness 最头疼的问题
 
 每一次 think-act-observe 循环都会往上下文里追加内容：
 
 ```
 第1轮: [System Prompt] [用户任务] → [模型回复] [工具结果]
 第2轮: [System Prompt] [用户任务] [模型回复] [工具结果] → [模型回复] [工具结果]
 第3轮: [System Prompt] [用户任务] [模型回复] [工具结果] [模型回复] [工具结果] → ...
 ```
 
 不加控制的话，几轮下来上下文就会爆炸。Harness 必须做这些事：
 
 - **Token 计数**：实时追踪已用的 tokens
 - **滑动窗口**：超过阈值后丢弃最早的历史
 - **摘要压缩**：把长对话压缩成摘要
 - **分层记忆**：短期（当前循环）vs 长期（跨 session 持久化）
 
 ## 工具调度：从声明到执行
 
 模型并不真的调用工具。模型只是输出一段特殊格式的文本：
 
 ```json
 {
   "function": "execute_command",
   "args": { "command": "ls -la" }
 }
 ```
 
 Harness 负责：
 
 1. **解析**这段特殊文本
 2. **路由**到对应的工具函数
 3. **执行**（带着权限检查、超时控制）
 4. **格式化**结果，塞回上下文让模型看到
 
 伪代码：
 
 ```javascript
 while (true) {
   const response = await llm.chat(messages);  // Think
 
   if (response.isText()) {
     return response.text;                      // 模型决定好了，结束
   }
 
   if (response.isToolCall()) {
     const toolName = response.toolName;
     const args = response.args;
 
     const result = await toolRegistry
       .get(toolName)
       .execute(args);                          // Act
 
     messages.push(response);                   // Observe
     messages.push({ role: 'tool', result });   // 把结果塞回去
   }
 }
 ```
 
 ## 一个简单的循环计数器
 
 没有 Harness 会允许 Agent 无限循环下去。常见的控制手段：
 
 - **最大迭代次数**：超过 20-50 轮强制终止
 - **时间超时**：超过 5 分钟未完成就结束
 - **重复检测**：连续 3 次做同一个操作就认为卡住了
 - **断路器**：错误率超过阈值就熔断
 
 Codex CLI 的 `loop_control.js` 中实现了这些控制的完整版本。
 
 ---
 
 [下一章：Harness 的核心设计 →](03-core-design.md)
