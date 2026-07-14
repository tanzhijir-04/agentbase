 # 📚 文档索引
 
 > 按章节和关键词快速定位所有文档。
 
 ---
 
 ## 📁 章节总览（12 章）
 
 | # | 章节 | 状态 | 前置依赖 | 文件清单 |
 |---|------|------|----------|---------|
 | 01 | Plan Mode | ✅ 完成 | — | README.md, analysis.md, complete.md, faq.md, implementation_guide.md, practice.md |
 | 02 | Memory 系统 | ✅ 完成 | — | README.md |
 | 03 | Context Compression | ✅ 完成 | 02-Memory | README.md, context_compression.md |
 | 04 | Multi-agent | ✅ 完成 | 01, 07 | README.md, multi_agent_management_guide.md, COMPLETION_REPORT.md, multi_agent_learning_summary.md |
 | 05 | Background Tasks | 📅 待学习 | 04 | README.md（占位） |
 | 06 | Skills/Plugins | ✅ 完成 | — | README.md, plugins_skills_system.md |
 | 07 | Loop/Workflow | ✅ 完成 | — | README.md, loop_control_guide.md |
 | 08 | Sandbox | 🔄 学习中 | 06, 07 | README.md, sandbox_guide.md |
 | 09 | MCP | 🔄 学习中 | 08 | README.md（概览已写，待深入） |
 | 10 | TUI | 🔄 学习中 | 07 | README.md（占位） |
 | 11 | Visualization | 🔄 学习中 | 03, 07 | README.md（占位） |
 | 12 | LangChain/LangGraph | 🔄 学习中 | 01, 02, 04, 07 | README.md, 01-05（5 篇子文档） |
 
 ---
 
 ## 🎯 关键词索引
 
 | 关键词 | 所在章节 | 对应代码文件 |
 |--------|---------|-------------|
 | Agent 循环 / 工具调用 | 01 Plan Mode | agent.js, agent_v2.js |
 | 短期记忆 / 长期记忆 / 信息提取 | 02 Memory | memory.js, agent_v2.js |
 | Token 压缩 / 摘要 / 剪枝 | 03 Context Compression | demos/demo_context_compression.js |
 | 主从模式 / 消息队列 / 任务调度 | 04 Multi-agent | multi_agent_system.js, message_queue.js, task_scheduler.js, multi_agent_collaboration.js |
 | Skills 注册 / 发现 / Plugin 加载 | 06 Skills/Plugins | skill_system.js, skill_discovery.js, plugin_system.js |
 | 循环控制器 / 断路器 / 速率限制 / 状态机 / DAG 工作流 | 07 Loop/Workflow | loop_control.js, workflow_engine.js |
 | 进程隔离 / 文件系统隔离 / 权限沙箱 | 08 Sandbox | (编写中) |
 | MCP 协议 / 工具注册 | 09 MCP | (待编写) |
 | TUI 终端界面 | 10 TUI | (待编写) |
 | 可视化 / Tracing | 11 Visualization | (待编写) |
 | Chain / RAG / Memory / Tool / LangGraph / Human-in-loop | 12 LangChain/LangGraph | langchain/basic_chain.py, rag_agent.py, langgraph_agent.py |
 
 ---
 
 ## 📖 推荐阅读路线
 
 ### 入门
 1. [教程总览](tutorials/README.md) — 先看概览和依赖图
 2. [Plan Mode](tutorials/01-plan-mode/README.md) — 理解 Agent 核心思维
 3. [Memory 系统](tutorials/02-memory-system/README.md) — 让 Agent 有记忆
 
 ### 进阶
 1. [Multi-agent 管理指南](tutorials/04-multi-agent/multi_agent_management_guide.md)
 2. [Loop/Workflow 控制指南](tutorials/07-loop-control/loop_control_guide.md)
 3. [Skills/Plugins 系统](tutorials/06-plugins/plugins_skills_system.md)
 
 ### LangChain/LangGraph 专题
 1. [总览](tutorials/12-langchain-langgraph/README.md) — Chain vs Graph 对比
 2. [LangChain 入门](tutorials/12-langchain-langgraph/01-langchain-intro.md)
 3. [LangChain 核心组件](tutorials/12-langchain-langgraph/02-langchain-core.md)
 4. [LangGraph 入门](tutorials/12-langchain-langgraph/03-langgraph-intro.md)
 5. [LangGraph 核心](tutorials/12-langchain-langgraph/04-langgraph-core.md)
 6. [完整实践](tutorials/12-langchain-langgraph/05-practice.md) — 可运行代码
 
 ---
 
 ## 🚀 快速开始
 
 ```bash
 # 1. 查看教程总览
 cat docs/tutorials/README.md
 
 # 2. 运行 JavaScript 代码/演示
 node minimal_agent/agent.js
 node minimal_agent/demos/demo_loop_control.js
 
 # 3. 运行全部测试
 .\minimal_agent\run_tests.ps1
 
 # 4. Python LangChain 示例（需要 venv）
 cd minimal_agent
 python langchain/basic_chain.py
 python langchain/rag_agent.py
 python langchain/langgraph_agent.py
 ```
 
 ---
 
 *索引更新时间：2026年7月14日*



