 # 01 — Claude Code 源码架构深度复盘

> 本文是整个系列的核心，从源码层面拆解 Claude Code 的全部核心机制。
 
 > 基于 Claude Code 泄露源码（npm sourcemap）分析整理。
 > 摘要：本文从源码层面拆解 Claude Code 的全部核心机制，帮助 Agent 开发者和学习者理解"工业级 AI Agent"的设计方式与实现。
 
 ---
 
 ## 目录
 
 1. [整体架构：从入口到循环](#1-整体架构从入口到循环)
 2. [Tool 系统：Agent 的"双手"](#2-tool-系统agent-的双手)
 3. [QueryEngine：Agent 的"大脑循环"](#3-queryengineagent-的大脑循环)
 4. [Plan Mode（计划模式）](#4-plan-mode计划模式)
 5. [Memory 系统（记忆系统）](#5-memory-系统记忆系统)
 6. [Context Compression（上下文压缩）](#6-context-compression上下文压缩)
 7. [Multi-Agent 管理（多 Agent 协作）](#7-multi-agent-管理多-agent-协作)
 8. [Skills 与 Plugins 系统](#8-skills-与-plugins-系统)
 9. [MCP（Model Context Protocol）集成](#9-mcpmodel-context-protocol集成)
 10. [Background Tasks（后台任务）](#10-background-tasks后台任务)
 11. [Sandbox 环境控制](#11-sandbox-环境控制)
 12. [TUI 终端 UI 引擎](#12-tui-终端-ui-引擎)
 13. [可观测性与遥测](#13-可观测性与遥测)
 14. [设计哲学总结](#14-设计哲学总结)
 15. [Agent 开发者学习清单](#15-agent-开发者学习清单)
 
 ---
 
 ## 1. 整体架构：从入口到循环
 
 ### 1.1 宏观结构
 
 Claude Code 是一个巨大的 **单页 React 终端应用**，入口在 `src/main.tsx`（785KB+），启动后常驻运行。
 
 架构分为三层：
 
 ```
 ┌─────────────────────────────────────────────┐
 │                   main.tsx                    │  CLI 入口、命令解析、初始化
 ├─────────────────────────────────────────────┤
 │              Ink (自定义 React TUI)           │  终端渲染引擎
 ├─────────────────────────────────────────────┤
 │              QueryEngine                     │  LLM 循环核心
 ├─────────────────────────────────────────────┤
 │    Tool 1   │   Tool 2  │  ...  │  Tool N   │  40+ 工具
 └─────────────────────────────────────────────┘
 ```
 
 ### 1.2 核心循环
 
 整个 Agent 的运行逻辑在 **QueryEngine** 里，一个极其精简的循环：
 
 ```
 1. 用户输入
 2. 处理输入（processUserInput）
 3. 构建消息（含系统提示、记忆、上下文）
 4. 调用 LLM API（queryModelWithStreaming）
 5. 流式解析响应（文本 / Tool 调用 / 思考）
 6. 有 Tool 调用 → 执行 Tool → 结果加回消息 → 回到 4
 7. 无 Tool 调用 → 对话结束，等待下一轮输入
 ```
 
 关键代码结构（`src/QueryEngine.ts`）：
 
 ```typescript
 export class QueryEngine {
   private mutableMessages: Message[]
   private totalUsage: NonNullableUsage
 
   async submitMessage(userInput: string): Promise<void> {
     // 1. 处理用户输入
     const ctx = await this.buildProcessUserInputContext()
     const processed = await processUserInput(userInput, ctx)
 
     // 2. 构建消息列表
     const messages = this.buildMessages(processed)
 
     // 3. 进入 LLM 循环
     await this.runQueryLoop(messages)
   }
 
   private async runQueryLoop(messages: Message[]) {
     while (true) {
       const response = await queryModelWithStreaming(messages, ...)
 
       if (hasToolCalls(response)) {
         for (const toolCall of response.toolCalls) {
           const result = await this.executeTool(toolCall)
           messages.push(toolCallMessage, resultMessage)
         }
         continue // 继续循环
       }
       break // 没有更多 Tool 调用，结束
     }
   }
 }
 ```
 
 **这是所有 Agent 框架最核心的模式**：模型每轮可以调工具，工具结果送回模型，模型再决定下一步，直到模型认为任务完成。
 
 ---
 
 ## 2. Tool 系统：Agent 的"双手"
 
 ### 2.1 Tool 的定义
 
 每个 Tool 都是一个实现了标准接口的对象（`src/Tool.ts`）：
 
 ```typescript
 type Tool = {
   name: string
   description: () => Promise<string>
   prompt: () => Promise<string>
   inputSchema: z.ZodSchema
   outputSchema: z.ZodSchema
   call: (input, context) => Promise<Result>
   isEnabled?: () => boolean
   isReadOnly?: () => boolean
   renderToolUseMessage?: ...
 }
 ```
 
 ### 2.2 通过 buildTool 注册
 
 所有 Tool 用 `buildTool()` 函数创建：
 
 ```typescript
 export const BashTool = buildTool({
   name: 'bash',
   isReadOnly: () => false,
   maxResultSizeChars: 100_000,
   async prompt() { return BASH_PROMPT },
   async call(input, context) {
     const result = await executeCommand(input.command)
     return { data: result }
   },
 })
 ```
 
 ### 2.3 40+ 内置 Tool
 
 | 工具名 | 用途 |
 |--------|------|
 | BashTool | 执行 shell 命令（带安全检测） |
 | FileReadTool | 读取文件 |
 | FileWriteTool | 写入文件 |
 | FileEditTool | 编辑文件（diff-based） |
 | GrepTool | 文本搜索（ripgrep） |
 | GlobTool | 文件查找 |
 | WebFetchTool | 网页抓取 |
 | WebSearchTool | 网络搜索 |
 | AgentTool | 创建子 agent |
 | MCPTool | 调用 MCP 服务器工具（动态） |
 | SkillTool | 调用 skill |
 | TaskCreateTool | 创建后台任务 |
 
 ### 2.4 设计要点
 
 - **Schema 驱动**：每个 Tool 有完整的 Zod schema，模型自动生成 JSON 参数
 - **权限分层**：`checkPermissions()` 控制是否允许执行
 - **UI 分离**：renderToolUseMessage 让终端知道怎么展示
 - **动态启用**：isEnabled 可根据配置/环境开关
 
 **对 Agent 开发的启示**：把所有能力封装成工具，让模型自主决定调用顺序和参数，比写死工作流灵活得多。
 
 ---
 
 ## 3. QueryEngine：Agent 的"大脑循环"
 
 ### 3.1 完整生命周期
 
 ```
 submitMessage(input)
   │
   ├─ buildProcessUserInputContext()
   │   ├─ 加载系统提示（skills、memory、tools）
   │   ├─ 处理 slash 命令
   │   └─ 合并外部上下文
   │
   ├─ processUserInput(input, ctx)
   │   ├─ /command → 本地执行
   │   ├─ @mention → 加载文件/agent
   │   └─ 普通文本 → 构造 UserMessage
   │
   ├─ buildMessages(processed)
   │   ├─ system prompt（工具描述、记忆、约束）
   │   ├─ 历史消息
   │   └─ 新用户消息
   │
   └─ runQueryLoop(messages)
       │
       ├─ queryModelWithStreaming()
       │   ├─ streaming text → 实时渲染
       │   ├─ streaming thinking → 展示思考
       │   └─ streaming tool_use → 解析参数
       │
       ├─ [有 tool_call] → executeTool()
       │   ├─ 权限检查（hasPermissionsToUseTool）
       │   ├─ 执行（tool.call）
       │   └─ 结果放回 messages → 继续循环
       │
       └─ [无 tool_call] → stop hooks
           ├─ extractMemories
           ├─ autoDream 检查
           └─ 等待下一轮输入
 ```
 
 ### 3.2 关键设计决策
 
 **1. 消息列表可变**：整个对话 messages 数组不断增长。压缩时插入边界标记、删除旧消息。
 
 **2. 没有"函数调用"抽象**：模型返回的就是标准 Anthropic API tool_use block。
 
 **3. 渲染与逻辑分离**：QueryEngine 是纯逻辑层，UI 更新通过 setAppState 回调推送到 React/Ink。
 
 **4. Token 预算管理**：utils/tokenBudget.ts 和 utils/context.ts 在每轮前后计算用量。
 
 ### 3.3 Forked Agent 模式
 
 Claude Code 大量使用 **forked agent** 模式（`utils/forkedAgent.ts`）：
 
 ```typescript
 async function runForkedAgent(params) {
   const child = fork(modulePath)
   const messages = [...parentMessages, newInstruction]
   const result = await child.run(messages, { maxTurns: 3 })
   return result
 }
 ```
 
 用在：记忆提取（extractMemories）、后台 consolidation（autoDream）、子 agent 执行（AgentTool）。
 
 **对 Agent 开发的启示**：用子进程跑"小 Agent"做辅助任务，比让主 Agent 自己做更便宜、更可控。
 
 ---
 
 ## 4. Plan Mode（计划模式）
 
 ### 4.1 实现方式
 
 核心是两个 Tool + 状态切换：
 
 ```
 EnterPlanModeTool → [Plan Mode 状态] → ExitPlanModeTool
 ```
 
 **EnterPlanModeTool（`src/tools/EnterPlanModeTool/`）**：
 
 ```typescript
 export const EnterPlanModeTool = buildTool({
   name: 'enter_plan_mode',
   async call(_input, context) {
     handlePlanModeTransition('enter')
     prepareContextForPlanMode(context)
     return { message: '已进入计划模式。' }
   }
 })
 ```
 
 ### 4.2 v2 多 Agent 探索
 
```src/utils/planModeV2.ts`：
 
 ```typescript
 export function getPlanModeV2AgentCount(): number {
   if (subscriptionType === 'max') return 3
   if (subscriptionType === 'enterprise') return 3
   return 1
 }
 ```
 
 多 agent 模式：主 agent spawn 多个子 agent 探索不同方向，汇总写最终计划。
 
 ### 4.3 计划文件
 
 每个 plan 生成唯一 slug，写入 `~/.claude/plans/<slug>.md`。
 
 **对 Agent 开发的启示**："模式切换"是最轻量的行为控制方式——改提示比改代码快得多。
 
 ---
 
 ## 5. Memory 系统（记忆系统）
 
 ### 5.1 整体架构
 
 ```
 文件层  ~/.claude/projects/<slug>/memory/ (Markdown 文件)
   ↑
 检索层  findRelevantMemories (Sonnet 语义筛选)
   ↑
 提取层  extractMemories (每次对话结束自动运行)
   ↑
 整合层  autoDream (后台 consolidation)
 ```
 
 ### 5.2 四类记忆
 
 `src/memdir/memoryTypes.ts`：
 
 ```typescript
 export const MEMORY_TYPES = ['user', 'feedback', 'project', 'reference'] as const
 // user     → 用户角色、偏好
 // feedback → 修正或肯定
 // project  → 项目进展
 // reference → 参考文档
 ```
 
 每个文件用 YAML frontmatter：
 
 ```markdown
 ---
 type: feedback
 scope: private
 ---
 具体内容...
 ```
 
 入口 `MEMORY.md` 限制 200 行 / 25KB。
 
 ### 5.3 语义检索
 
 ```typescript
 async function selectRelevantMemories(query, memories) {
   const result = await sideQuery({
     model: getDefaultSonnetModel(),
     system: `你是一个记忆选择器。根据用户查询选择最相关的记忆（最多5个）...`,
     messages: [`QUERY: ${query}\n\nAVAILABLE: ${manifest}`]
   })
   return result.selectedFilenames
 }
 ```
 
 **用 LLM 做 RAG 检索器**，比关键字/向量更准确。
 
 ### 5.4 自动提取
 
 每次对话结束触发，用 forked agent 分析对话内容并写入记忆文件。
 
 ### 5.5 后台 Consolidation
 
 `src/services/autoDream/autoDream.ts`：三重门控（时间/会话数/锁），定期整合记忆。
 
 **对 Agent 开发的启示**：记忆是活的数据——要设计检索策略、自动提取、后台整合，不是存进去就不管了。
 
 ---
 
 ## 6. Context Compression（上下文压缩）
 
 ### 6.1 两种压缩方式
 
 **全量压缩**（`src/services/compact/compact.ts`）：
 
 ```typescript
 export async function compactConversation(messages) {
   // 1. 去掉图片（省钱）
   const textMessages = stripImagesFromMessages(messages)
   // 2. 调用总结模型
   const summary = await queryModelWithStreaming({
     messages: [...textMessages, compactPrompt],
     tool_choice: { type: 'none' }
   })
   // 3. 插入压缩边界 + 删除旧消息
   // 4. 恢复重要文件内容
   await restoreImportantFiles(messages)
 }
 ```
 
 **微压缩**（`src/services/compact/microCompact.ts`）：
 
 只清空特定工具的返回内容，保留调用结构：
 
 ```typescript
 const COMPACTABLE_TOOLS = new Set([
   'FileRead', 'Bash', 'Grep', 'Glob',
   'WebSearch', 'WebFetch', 'FileEdit', 'FileWrite'
 ])
 // 替换为: [Old tool result content cleared]
 ```
 
 ### 6.2 自动触发
 
 `autoCompact.ts` 监控 token 用量，接近上限时自动触发。
 
 **对 Agent 开发的启示**：分两层压缩——微压缩清理工具输出，全量压缩总结历史。自动触发比手动好。
 
 ---
 
 ## 7. Multi-Agent 管理（多 Agent 协作）
 
 ### 7.1 Leader-Worker 架构
 
 ```
    Leader
    ├─ AgentTool → Worker 1 (搜索)
    ├─ AgentTool → Worker 2 (分析)
    └─ 汇总结果
 ```
 
 ### 7.2 AgentTool
 
 `src/tools/AgentTool/runAgent.ts`：
 
 ```typescript
 async function runAgent({ agentDefinition, parentMessages, tools }) {
   const agentId = createAgentId()
   const agentTools = resolveAgentTools(agentDefinition, parentTools)
   const mcpClients = await initializeAgentMcpServers(agentDefinition, parentClients)
   const result = await query({
     messages: [systemPrompt, userMessage],
     tools: agentTools,
     maxTurns: agentDefinition.maxTurns ?? 20,
   })
   await cleanupAgent()
 }
 ```
 
 ### 7.3 通信方式
 
 通过 **mailbox（信箱）** 系统通信：
 
 ```typescript
 writeToMailbox(recipientId, { type: 'permission_request', ... })
 readMailbox(myId) // → 消息列表
 ```
 
 支持 in-process（同进程）和分离后端（iTerm2/Tmux）。
 
 ### 7.4 内置 Agent 类型
 
 - generalPurposeAgent（通用）
 - exploreAgent（探索）
 - planAgent（计划）
 - verificationAgent（验证）
 - claudeCodeGuideAgent（指南）
 
 **对 Agent 开发的启示**：子 agent = 派生 + 隔离 + 通信。给每个子 agent 独立上下文和工具集。
 
 ---
 
 ## 8. Skills 与 Plugins 系统
 
 ### 8.1 Skills（技能）
 
 Bundled Skill 注册（`src/skills/bundledSkills.ts`）：
 
 ```typescript
 registerBundledSkill({
   name: 'loop',
   description: 'Run a prompt on a recurring interval',
   async getPromptForCommand(args) {
     return [{ type: 'text', text: buildPrompt(args) }]
   },
 })
 ```
 
 文件 Skill：从目录加载 Markdown 文件，有 YAML frontmatter。
 
 ### 8.2 Plugins（插件）
 
 ```typescript
 type BuiltinPluginDefinition = {
   name: string
   description: string
   version: string
   defaultEnabled?: boolean
   hooks?: HooksSettings
   mcpServers?: McpServerConfig[]
   skills?: BundledSkillDefinition[]
 }
 ```
 
 插件有版本管理、自动更新、市场安装。
 
 ### 8.3 区别
 
 | 维度 | Skills | Plugins |
 |------|--------|---------|
 | 粒度 | 单个指令模板 | 多组件包 |
 | 版本管理 | 无 | 有 |
 | 能力范围 | prompt 指令 | prompt + hooks + MCP + commands |
 
 **对 Agent 开发的启示**：Skill 给模型看，Plugin 给用户装。轻量重量的分界。
 
 ---
 
 ## 9. MCP（Model Context Protocol）集成
 
 ### 9.1 客户端架构
 
 `src/services/mcp/client.ts`：
 
 ```typescript
 export async function connectToServer(config) {
   let transport
   switch (config.type) {
     case 'stdio':
       transport = new StdioClientTransport({ command, args })
       break
     case 'sse':
       transport = new SSEClientTransport(new URL(url))
       break
     case 'streamable-http':
       transport = new StreamableHTTPClientTransport(url)
       break
   }
   const client = new Client({ name: 'claude-code', version: '1.0' })
   await client.connect(transport)
   return client
 }
 ```
 
 ### 9.2 工具动态注入
 
 MCP 工具在连接后动态获取并生成 MCPTool 实例。
 
 ### 9.3 配置
 
 在 `.claude/mcp.json` 中配置服务器。
 
 **对 Agent 开发的启示**：MCP 标准化了工具发现和调用模式，是 Agent 扩展能力的好协议。
 
 ---
 
 ## 10. Background Tasks（后台任务）
 
 ### 10.1 Cron 调度
 
 `src/tools/ScheduleCronTool/`：
 
 ```typescript
 const CronCreateTool = buildTool({
   name: 'cron_create',
   async call(input) {
     const task = addCronTask({
       cron: input.cron,
       prompt: input.prompt,
       recurring: input.recurring,
     })
     return { id: task.id, humanSchedule: cronToHuman(cronExpr) }
   }
 })
 ```
 
 `/loop` skill 把自然语言转成 cron 任务。
 
 ### 10.2 远程后台 Session
 
 `src/utils/background/remote/`：在 teleport 环境跑长时间任务。
 
 **对 Agent 开发的启示**：后台任务 = 时间触发 + 持久化 + 生命周期管理。
 
 ---
 
 ## 11. Sandbox 环境控制
 
 ### 11.1 实现方式
 
 基于 `@anthropic-ai/sandbox-runtime`：
 
 ```typescript
 const sandboxConfig = {
   filesystem: { read: [...], write: [...] },
   network: { allow: [...], deny: [...] },
 }
 ```
 
 ### 11.2 约束类型
 
 - 文件系统读写白名单
 - 网络域名模式
 - 命令 hook 拦截
 
 **对 Agent 开发的启示**：沙箱和权限系统配合使用，配置驱动比硬编码灵活。
 
 ---
 
 ## 12. TUI 终端 UI 引擎
 
 ### 12.1 自建 Ink
 
 `src/ink/` 包含完整的 React 终端渲染引擎：
 
 - `ink.tsx` — 主入口，实例管理
 - `reconciler.ts` — React Reconciler
 - `dom.ts` — 终端 DOM 节点
 - `screen.ts` — 屏幕缓冲
 - `layout/` — Yoga Flexbox 布局
 - `events/` — 键盘、鼠标、焦点
 - `termio/` — ANSI 序列处理
 
 ### 12.2 Reconciler
 
 ```typescript
 const reconciler = createReconciler({
   createInstance(type, props) {
     return createNode(type, props)
   },
   appendChild(parent, child) {
     appendChildNode(parent, child)
   },
 })
 ```
 
 **对 Agent 开发的启示**：好终端 UI = 组件化 + 差异渲染 + 事件系统 + 布局引擎。
 
 ---
 
 ## 13. 可观测性与遥测
 
 - GrowthBook 功能开关
 - 事件日志（Event logging）
 - Profiling（startupProfiler, queryProfiler）
 - 诊断命令（/doctor, /stats, /thinkback, /heapdump）
 
 **对 Agent 开发的启示**：没有遥测，你根本不知道模型为什么做了某个决定。
 
 ---
 
 ## 14. 设计哲学总结
 
 ### ① 一切皆工具
 
 所有能力包装成 Tool，模型自主决定调用时机。
 
 ### ② 提示即代码
 
 很多"特性"本质上是换了一套 system prompt。
 
 ### ③ 分层数据处理
 
 压缩分两层、记忆分四层。每层有自己的职责和触发条件。
 
 ### ④ Forked Agent 模式
 
 辅助任务全用 forked agent 跑，隔离上下文、限制轮数。
 
 ### ⑤ 组合优于继承
 
 Skill 可组合，Plugin 可包含多重组件，MCP 可挂多个服务器。
 
 ### ⑥ 权限分层
 
 用户权限 → 策略权限 → Tool 权限 → Sandbox。四层防护。
 
 ### ⑦ 状态驱动 UI
 
 逻辑层（QueryEngine）不直接操作 UI，通过 AppState 推送。
 
 ### ⑧ 从使用中学习
 
 Memory 系统自动提取对话信息，Agent 越用越了解用户。
 
 ### ⑨ 渐进式能力
 
 功能相同，规模不同。功能开关控制。
 
 ### ⑩ 可观测性优先
 
 每个关键路径都有日志和 A/B 测试。
 
 ---
 
 ## 15. Agent 开发者学习清单
 
 ### Level 1：最小 Agent
 
 - LLM 调用循环
 - 2~3 个基础 Tool
 - 消息历史管理
 
 ### Level 2：好的体验
 
 - 系统提示结构化
 - Token 预算管理
 - Tool Schema 定义
 - 流式渲染
 
 ### Level 3：记忆与上下文
 
 - 文件系统记忆
 - LLM 驱动的记忆检索
 - 对话自动提取
 - 上下文压缩
 
 ### Level 4：多 Agent
 
 - AgentTool
 - Forked Agent 模式
 - Agent 间通信
 
 ### Level 5：可扩展
 
 - Skills 系统
 - Plugins 系统
 - MCP 协议集成
 - 后台任务调度
 
 ### Level 6：工业级
 
 - 权限系统
 - Sandbox 隔离
 - A/B 测试框架
 - 遥测监控
 - 终端 UI 引擎
 
 ---
 
 ## 参考
 
 - 源码仓库：C:\Users\20300\Desktop\claude-code
 - 学习项目：C:\Users\20300\Desktop\AI-Agent-Study
 - 对应学习进度中的 [x] 标记特性
 
 ---
 
 *最后更新：2026年7月14日*
 *基于 Claude Code 源码（npm sourcemap 泄露版）分析*
