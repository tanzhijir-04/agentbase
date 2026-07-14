 # 📖 教程总览
 
 > 从零开始的 AI Agent 学习系列。共 12 章，按依赖关系排列。
 
 ---
 
 ## 🗺️ 依赖关系图
 
 先看这张图，再决定从哪一章开始：
 
 ```mermaid
 flowchart LR
     01[01 Plan Mode] --> 04[04 Multi-agent]
     02[02 Memory] --> 03[03 Context Compression]
     07[07 Loop/Workflow] --> 04
     06[06 Skills/Plugins] --> 08[08 Sandbox]
     08 --> 09[09 MCP]
     07 --> 10[10 TUI]
     03 --> 11[11 Visualization]
     07 --> 11
     01 & 02 & 04 & 07 --> 12[12 LangChain/LangGraph]
 
     01 -->|推荐入口| 02
     02 --> 07
 ```
 
 **阅读建议：** 箭头指向表示前置依赖。例如 04 Multi-agent 依赖 01 Plan Mode 和 07 Loop/Workflow，建议先学完它们再开始 04。
 
 ---
 
 ## 学习路径
 
 | # | 章节 | 状态 | 前置依赖 | 核心代码 |
 |---|------|------|----------|---------|
 | 01 | [Plan Mode](01-plan-mode/) | ✅ 完成 | — | plan_mode.js / plan_mode_enhanced.js |
 | 02 | [Memory 系统](02-memory-system/) | ✅ 完成 | — | memory.js, agent_v2.js |
 | 03 | [上下文压缩](03-context-compression/) | ✅ 完成 | 02-Memory | demos/demo_context_compression.js |
 | 04 | [Multi-agent](04-multi-agent/) | ✅ 完成 | 01, 07 | multi_agent_system.js, message_queue.js, task_scheduler.js |
 | 05 | [后台任务](05-background-tasks/) | 📅 待学习 | 04 | — |
 | 06 | [Skills/Plugins](06-plugins/) | ✅ 完成 | — | skill_system.js, skill_discovery.js, plugin_system.js |
 | 07 | [Loop/Workflow 控制](07-loop-control/) | ✅ 完成 | — | loop_control.js, workflow_engine.js |
 | 08 | [沙箱环境](08-sandbox/) | 🔄 学习中 | 06, 07 | sandbox_guide.md（编写中） |
 | 09 | [MCP 配置](09-mcp/) | 🔄 学习中 | 08 | — |
 | 10 | [TUI 优化](10-tui/) | 🔄 学习中 | 07 | — |
 | 11 | [可视化](11-visualization/) | 🔄 学习中 | 03, 07 | — |
 | 12 | [LangChain/LangGraph](12-langchain-langgraph/) | 🔄 学习中 | 01, 02, 04, 07 | langchain/basic_chain.py, rag_agent.py, langgraph_agent.py |
 
 ---
 
 ## 快速导航
 
 ### 按兴趣方向
 
 | 方向 | 推荐路线 |
 |------|---------|
 | 🐣 刚接触 Agent | 01 → 02 → 07 |
 | 🏗️ 想深入架构 | 03 → 04 → 08 → 09 |
 | 🔌 想扩展技能 | 06 → 08 → 09 |
 | 🧠 对 LLM 框架感兴趣 | 01 → 02 → 04 → 07 → 12 |
 | 🖥️ 关注终端和可视化 | 07 → 10 → 11 |
 
 ### 按 Agent 特性
 
 | 特性 | 相关章节 |
 |------|---------|
 | 规划 / 推理 | 01, 07 |
 | 记忆 / 上下文 | 02, 03 |
 | 多 Agent 协作 | 04, 05 |
 | 技能扩展 | 06 |
 | 安全与协议 | 08, 09 |
 | 界面 | 10, 11 |
 | LLM 框架 | 12 |
 
 ### 最新章节
 
 - **12-LangChain/LangGraph** — 从零理解 Chain、Memory、RAG、Tool、Agent 机制，以及 LangGraph 图状态管理与 Human-in-loop。包含 3 个可运行的 Python 示例。
 - **08-Sandbox** — 进程隔离、文件系统隔离、权限沙箱的完整概念指南。
 
 ---
 
 ## 运行代码示例
 
 ```bash
 # JavaScript 示例（Node.js）
 node minimal_agent/agent.js
 node minimal_agent/demos/demo_loop_control.js
 .\minimal_agent\run_tests.ps1
 
 # Python 示例
 cd minimal_agent
 python langchain/basic_chain.py
 python langchain/rag_agent.py
 python langchain/langgraph_agent.py
 ```
 
 *更新时间：2026年7月14日*
