 # Codex CLI 中的 Harness
 
 这一章用仓库里的 `agent_v2.js` 作为样本，看一个真实的 Harness 是怎么搭建的。
 
 完整的源码在 [minimal_agent/agent_v2.js](https://github.com/tanzhijir-04/AI-Agent-Study/blob/main/minimal_agent/agent_v2.js)。
 
 ## 整体架构
 
 ```
 agent_v2.js
 │
 ├── MinimalCodingAgent  ← 这就是 Harness
 │   ├── executeCommand()     ← 工具: 执行终端命令
 │   ├── readFile()           ← 工具: 读取文件
 │   ├── writeFile()          ← 工具: 写入文件
 │   ├── PlanMode             ← 上层的执行计划
 │   └── MemoryManager        ← 上下文记忆系统
 │
 ├── LanguageDetector    ← 辅助模块
 │
 └── main()              ← 交互循环 (REPL)
 ```
 
 `MinimalCodingAgent` 本身就是一个轻量级的 Harness 实现。
 
 ## 1. 工具注册（核心能力）
 
 在 CC 的实现里，工具不是用注册表注册的，而是直接在类上作为方法存在：
 
 ```javascript
 class MinimalCodingAgent {
     constructor(workingDirectory = '.') {
         this.workingDirectory = path.resolve(workingDirectory);
         this.history = [];
         this.planMode = new PlanMode(this);
         this.memory = new MemoryManager();
     }
 
     executeCommand(command) { /* 执行 shell 命令 */ }
     readFile(filePath)      { /* 读文件 */ }
     writeFile(filePath, content) { /* 写文件 */ }
 }
 ```
 
 虽然形式上没有单独的 `ToolRegistry`，但设计意图是一样的：把"模型想要做的事情"映射到"真实系统的操作"。
 
 每个工具方法都遵循同一个模式：
 
 ```javascript
 executeCommand(command) {
     try {
         // 1. 记录操作
         this.history.push(`EXECUTE: ${command}`);
         // 2. 实际执行
         const output = execSync(command, { /* options */ });
         // 3. 记录到记忆
         this.memory.addAssistantMessage(`执行命令: ${command}\n输出: ...`);
         // 4. 返回结果
         return { success: true, output };
     } catch (error) {
         return { success: false, output: error.stderr };
     }
 }
 ```
 
 这个模式对应了 Harness 的核心职责：
 
 - **执行工具**（execSync）
 - **记录副作用**（push to history）
 - **更新上下文**（memory.addAssistantMessage）
 - **处理错误**（try-catch → 返回错误信息）
 
 ## 2. 驱动循环
 
 CC 的 Harness 有两个循环层次：
 
 **外层：REPL（Read-Eval-Print Loop）**
 
 ```javascript
 async function main() {
     while (true) {
         const userInput = await askQuestion('🤖 Agent> ');
         // 解析命令 → 分发执行
     }
 }
 ```
 
 这是用户和 Agent 的交互循环——用户输入指令，Agent 执行并返回。
 
 **内层：Plan Mode 的 think-act-observe 循环**
 
 ```javascript
 async handleRequest(userRequest) {
     const plan = this.planMode.generatePlan(userRequest);
     this.planMode.displayPlan(plan);
     const userChoice = await this.getUserChoice();
     if (userChoice === '1') {
         await this.planMode.executePlan(plan);
     }
 }
 ```
 
 这里 `planMode.executePlan` 内部就是 think-act-observe 循环：读取计划 → 执行每一步 → 观察结果 → 决定下一步。
 
 ## 3. 上下文管理（Memory 系统）
 
 CC 的 Harness 把上下文分成两层：
 
 - **短期记忆**（shortTerm）：当前 session 的对话历史，用 `messages` 数组维护
 - **长期记忆**（longTerm）：跨 session 持久化，存到 `memory.json` 文件
 
 ```javascript
 learnFromUserMessage(message) {
     this.memory.addUserMessage(message);      // 短期记忆
     const extracted = this.extractUserInfo(message);
     extracted.forEach(info => {
         this.memory.longTerm.remember(info.key, info.value); // 长期记忆
     });
     return extracted;
 }
 ```
 
 短期记忆对应 Harness 的"上下文窗口"——每次循环都在这个窗口内追加内容。长期记忆则解决了跨 session 的持久化问题。
 
 ## 4. 和完整 Harness 的差距
 
 `agent_v2.js` 作为一个教学示例，已经展示了 Harness 的核心骨架。对比工业级 Harness（如 Codex CLI 的生产版本），它缺少的主要是：
 
 | 功能 | agent_v2.js | 生产级 Harness |
 |---|---|---|
 | 循环控制 | 无，依赖 Plan Mode | 迭代上限、断路器、速率限制、重复检测 |
 | 上下文窗口 | memory.json 简单实现 | 滑动窗口、Token 计数、自动压缩 |
 | 安全控制 | 无权限检查 | 命令白名单、文件路径校验、沙箱隔离 |
 | 可观测性 | 只有 console.log | Tracing、Logging、Telemetry |
 | 并发控制 | 单线程 | 请求队列、任务优先级 |
 | 工具发现 | 硬编码 | 动态注册、MCP Discovery |
 
 你在 `loop_control.js` 和 `workflow_engine.js` 中已经有了这些缺失功能的基础实现——它们就是把 Harness 从"能跑"推向"靠谱"的关键组件。
 
 ---
 
 [上一章：核心设计 ←](03-core-design.md)
 
 [下一章：手写一个迷你 Harness →](05-build-your-own.md)
