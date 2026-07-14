 # 🤖 AI Agent Study
 
 > 从零开始学习 AI Agent 开发的完整学习资源库。
 > 覆盖 12 个主题，配有可运行的 JavaScript/Python 代码实现、测试和教程文档。
 
 ---
 
 ## 🚀 极速开始
 
 ```bash
 # 运行基础 Agent
 node minimal_agent/agent.js
 
 # 运行全部测试
 .\minimal_agent\run_tests.ps1
 
 # LangChain 示例（Python）
 cd minimal_agent
 python langchain/basic_chain.py
 ```
 
 ---
 
 ## 📖 学习导航
 
 | 你想做什么 | 去看 |
 |-----------|------|
 | 搞清楚先学什么、后学什么 | [教程总览](docs/tutorials/README.md) —— 有依赖关系图 |
 | 快速搜索某个关键词或文件 | [文档索引](docs/INDEX.md) |
 | 直接看代码实现 | [minimal_agent/](minimal_agent/README.md) |
 | 了解如何贡献 | [AGENTS.md](AGENTS.md) |
 
 ---
 
 ## 📁 项目结构
 
 ```
 AI-Agent-Study/
 ├── README.md                           # 项目主页（本文件）
 ├── AGENTS.md                           # 贡献者指南
 ├── docs/                               # 文档目录
 │   ├── INDEX.md                        # 文档索引（关键词可搜）
 │   ├── claude-code-architecture-deep-dive.md   # 架构深度解析
 │   ├── tutorials/                      # 12 章教程
 │   │   ├── README.md                   # 总览 + 依赖图 ⭐
 │   │   ├── 01-plan-mode/               # ✅ Plan Mode（6 篇文档）
 │   │   ├── 02-memory-system/           # ✅ Memory 系统
 │   │   ├── 03-context-compression/     # ✅ 上下文压缩
 │   │   ├── 04-multi-agent/             # ✅ Multi-agent
 │   │   ├── 05-background-tasks/        # 📅 待学习
 │   │   ├── 06-plugins/                 # ✅ Skills/Plugins
 │   │   ├── 07-loop-control/            # ✅ Loop/Workflow
 │   │   ├── 08-sandbox/                 # 🔄 学习中
 │   │   ├── 09-mcp/                     # 🔄 学习中
 │   │   ├── 10-tui/                     # 🔄 学习中
 │   │   ├── 11-visualization/           # 🔄 学习中
 │   │   └── 12-langchain-langgraph/     # 🔄 LangChain/LangGraph
 │   └── git/                            # Git 配置和指南
 ├── minimal_agent/                      # Agent 代码实现
 │   ├── agent.js / agent.py             # v1.0（JS + Python）
 │   ├── agent_v2.js                     # v2.0（含 Memory）
 │   ├── memory.js / memory.json         # Memory 系统
 │   ├── plan_mode.js / plan_mode_enhanced.js   # Plan Mode
 │   ├── multi_agent_system.js           # Multi-agent 系统
 │   ├── message_queue.js                # 消息队列
 │   ├── task_scheduler.js               # 任务调度器
 │   ├── multi_agent_collaboration.js    # 协作示例
 │   ├── loop_control.js                 # 循环控制
 │   ├── workflow_engine.js              # DAG 工作流引擎
 │   ├── skill_system.js / skill_discovery.js   # 技能系统
 │   ├── plugin_system.js                # 插件系统
 │   ├── langchain/                      # LangChain/LangGraph 代码
 │   │   ├── basic_chain.py              # 最简单的 Chain
 │   │   ├── rag_agent.py                # RAG + Memory
 │   │   └── langgraph_agent.py          # LangGraph + Human-in-loop
 │   ├── demos/                          # 可运行演示（6 个）
 │   ├── tests/                          # 测试（全部通过 ✅）
 │   ├── run_tests.ps1                   # 一键运行测试
 │   └── run_multi_agent_demo.ps1        # 一键运行多 Agent 演示
 ├── skills/                             # 技能配置示例
 └── plugins/                            # 插件配置示例
 ```
 
 ## 📊 学习进度
 
 | # | 章节 | 状态 | 核心代码 | 测试覆盖 |
 |---|------|------|---------|---------|
 | 01 | Plan Mode | ✅ 完成 | plan_mode.js / plan_mode_enhanced.js | ✅ |
 | 02 | Memory 系统 | ✅ 完成 | memory.js, agent_v2.js | ✅ |
 | 03 | Context Compression | ✅ 完成 | demos/demo_context_compression.js | — |
 | 04 | Multi-agent | ✅ 完成 | multi_agent_system.js, message_queue.js, task_scheduler.js | ✅ |
 | 05 | Background Tasks | 📅 待学习 | — | — |
 | 06 | Skills/Plugins | ✅ 完成 | skill_system.js, skill_discovery.js, plugin_system.js | ✅ |
 | 07 | Loop/Workflow | ✅ 完成 | loop_control.js, workflow_engine.js | ✅ |
 | 08 | Sandbox | 🔄 学习中 | （编写中） | — |
 | 09 | MCP | 🔄 学习中 | — | — |
 | 10 | TUI | 🔄 学习中 | — | — |
 | 11 | Visualization | 🔄 学习中 | — | — |
 | 12 | LangChain/LangGraph | 🔄 学习中 | langchain/basic_chain.py, rag_agent.py, langgraph_agent.py | — |
 
 **图例：** ✅ 完成（文档 + 代码 + 测试就绪） · 🔄 学习中 · 📅 待学习
 
 ---
 
 ## 🎯 推荐阅读路线
 
 | 兴趣方向 | 推荐顺序 |
 |---------|---------|
 | 🐣 Agent 入门 | 01 Plan Mode → 02 Memory → 07 Loop/Workflow |
 | 🏗️ 架构进阶 | 03 Context → 04 Multi-agent → 08 Sandbox |
 | 🔌 扩展开发 | 06 Skills/Plugins → 09 MCP |
 | 🧠 LLM 框架 | 12 LangChain/LangGraph |
 | 🖥️ 界面相关 | 10 TUI → 11 Visualization |
 
 不确定的可以先看 [教程总览](docs/tutorials/README.md) 的依赖关系图。
 
 ## 🛠️ 常用命令
 
 ```bash
 # 文档
 cat docs/tutorials/README.md
 
 # 运行代码
 node minimal_agent/agent.js
 node minimal_agent/demos/demo_loop_control.js
 
 # 测试
 .\minimal_agent\run_tests.ps1
 # 或单文件
 node minimal_agent/tests/test_agent_v2.js
 
 # Python LangChain
 cd minimal_agent
 python langchain/basic_chain.py
 ```
 
 ## 📚 推荐资源
 
 - [Claude Code 文档](https://docs.anthropic.com/claude-code)
 - [OpenAI Codex 文档](https://platform.openai.com/docs/codex)
 - [MCP 协议](https://modelcontextprotocol.io)
 - [LangChain 文档](https://python.langchain.com/)
 - [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
 
 ## 🤝 贡献
 
 欢迎提交 Issue 和 PR！详见 [AGENTS.md](AGENTS.md)。
 
 ---
 
 *更新时间：2026年7月14日*



