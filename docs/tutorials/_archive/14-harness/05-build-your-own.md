 # 手写一个迷你 Harness
 
 这一章从一个 30 行的核心循环开始，逐步加上工具注册、上下文管理和安全控制，最终得到一个 100 行左右的完整 Harness。
 
 ## 第 1 版：循环骨架（~30 行）
 
 ```javascript
 class MiniHarness {
   constructor(llmClient) {
     this.llm = llmClient;           // 任何兼容的 LLM 客户端
     this.messages = [];              // 上下文消息列表
     this.tools = new Map();          // 工具注册表
     this.maxIterations = 20;         // 最大循环次数
   }
 
   registerTool(name, handler, schema) {
     this.tools.set(name, { handler, schema });
   }
 
   async run(task) {
     this.messages.push({ role: 'user', content: task });
 
     for (let i = 0; i < this.maxIterations; i++) {
       // 1. Think：把消息列表发给模型
       const response = await this.llm.chat(
         this.buildPrompt(),
         this.messages
       );
 
       // 2. Parse：模型决定是说话还是调用工具
       if (response.type === 'text') {
         return response.content;     // 模型给出最终答案
       }
 
       if (response.type === 'tool_call') {
         // 3. Act：执行工具
         const tool = this.tools.get(response.toolName);
         if (!tool) {
           throw new Error(`未知工具: ${response.toolName}`);
         }
         const result = await tool.handler(...response.args);
 
         // 4. Observe：把结果塞回上下文
         this.messages.push(response);     // 模型的 tool call
         this.messages.push({               // 工具的结果
           role: 'tool',
           content: JSON.stringify(result)
         });
         // 继续循环，让模型看到结果后决定下一步
       }
     }
 
     throw new Error('达到最大迭代次数，任务未完成');
   }
 
   buildPrompt() {
     // 把工具 schema 拼进 system prompt
     let prompt = `你有以下工具可用:\n\n`;
     for (const [name, { schema }] of this.tools) {
       prompt += `## ${name}\n${JSON.stringify(schema, null, 2)}\n\n`;
     }
     prompt += `需要调用工具时，用 JSON 格式输出工具名称和参数。`;
     return prompt;
   }
 }
 ```
 
 这个版本已经能跑了。注册几个工具，传给 LLM 客户端，就能看到一个 Agent 在工作。
 
 ## 第 2 版：加上工具实现（~50 行）
 
 ```javascript
 const harness = new MiniHarness(yourLLMClient);
 
 // 注册一个终端命令工具
 harness.registerTool(
   'execute_command',
   async (command) => {
     const { execSync } = require('child_process');
     return execSync(command, { encoding: 'utf-8' });
   },
   {
     description: '执行 shell 命令',
     parameters: {
       command: { type: 'string', description: '要执行的命令' }
     }
   }
 );
 
 // 注册一个文件读取工具
 harness.registerTool(
   'read_file',
   async (path) => {
     const fs = require('fs');
     return fs.readFileSync(path, 'utf-8');
   },
   {
     description: '读取文件内容',
     parameters: {
       path: { type: 'string', description: '文件路径' }
     }
   }
 );
 
 // 跑起来
 const result = await harness.run('帮我看看当前目录下有哪些文件');
 console.log(result);
 ```
 
 ## 第 3 版：加上安全和控制（~100 行）
 
 ```javascript
 class SafeHarness extends MiniHarness {
   constructor(llmClient, options = {}) {
     super(llmClient);
     this.allowedCommands = options.allowedCommands || ['ls', 'cat', 'node'];
     this.workspaceRoot = options.workspaceRoot || process.cwd();
     this.maxToolOutput = options.maxToolOutput || 2000; // 截断过长输出
     this.timeoutMs = options.timeoutMs || 30000;
   }
 
   async executeCommand(command) {
     // 安全检查：只允许白名单内的命令
     const cmdName = command.split(' ')[0];
     if (!this.allowedCommands.includes(cmdName)) {
       throw new Error(`命令 "${cmdName}" 不在白名单中`);
     }
 
     const { execSync } = require('child_process');
     const output = execSync(command, {
       encoding: 'utf-8',
       timeout: this.timeoutMs,
       cwd: this.workspaceRoot
     });
 
     // 截断过长输出，防止上下文爆炸
     if (output.length > this.maxToolOutput) {
       return output.slice(0, this.maxToolOutput) +
         `\n...(输出被截断，共 ${output.length} 字符)`;
     }
     return output;
   }
 
   async readFile(filePath) {
     // 安全检查：限制在工作目录内
     const path = require('path');
     const absolute = path.resolve(this.workspaceRoot, filePath);
     if (!absolute.startsWith(this.workspaceRoot)) {
       throw new Error('不允许读取工作目录外的文件');
     }
 
     const fs = require('fs');
     return fs.readFileSync(absolute, 'utf-8');
   }
 }
 
 // 使用
 const harness = new SafeHarness(yourLLMClient, {
   allowedCommands: ['ls', 'cat', 'node', 'git'],
   workspaceRoot: '/path/to/project',
   maxToolOutput: 3000,
   timeoutMs: 10000
 });
 
 harness.registerTool('execute_command', harness.executeCommand.bind(harness), { /* schema */ });
 harness.registerTool('read_file', harness.readFile.bind(harness), { /* schema */ });
 ```
 
 ## 和真实 Harness 的对比
 
 这个迷你 Harness 和 `agent_v2.js` 在本质上是同一类东西：一个 while 循环 + 工具映射 + 上下文管理。只不过你的版本用了 Plan Mode 做上层调度，而这里是直接循环。
 
 要把它变成生产级 Harness，接下来的路是：
 
 1. **接入 MCP 协议**：工具不用手动注册，从 MCP Server 动态发现
 2. **加 Tracing**：每一步都打日志，方便调试
 3. **分布式状态**：把 `this.messages` 存到外部存储，支持断点续跑
 4. **多 Agent 调度**：用消息队列给多个 Harness 实例分配任务
 
 这些方向在你的 `multi_agent_system.js`、`message_queue.js` 和 `workflow_engine.js` 里已经有了雏形。
 
 ---
 
 [← 返回总览](README.md)
 
 *相关文件：[agent_v2.js](../../../minimal_agent/agent_v2.js)、[loop_control.js](../../../minimal_agent/loop_control.js)*
