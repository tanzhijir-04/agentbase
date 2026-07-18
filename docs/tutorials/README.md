# 📖 AI Agent 开发学习路径

> 从零到面试，A 到 Z 的 Agent 开发学习指南。共 24 章 + 5 个附录，按六个阶段递进。

---

## 🗺️ 学习路径总览

`
第一阶段：基础篇 · 跑起来（第 01-04 章）
  "写个 Agent 先看看长什么样"
  
第二阶段：架构篇 · 拆引擎（第 05-08 章）
  "理解 Agent 内部是怎么工作的"

第三阶段：扩展篇 · 变强（第 09-11 章）
  "让 Agent 能做更多、更安全的事"

第四阶段：工程篇 · 做成产品（第 12-16 章）
  "从玩具 Demo 到生产可用"

第五阶段：实践篇 · 融会贯通（第 17-20 章）
  "框架对照 + 场景实战 + 完整项目"

第六阶段：面试冲刺篇（第 21-24 章）
  "学完直接去面试"
`

---

## 第一阶段：基础篇 · 跑起来

核心目标：用最快速度让读者理解 Agent 是什么，并写出第一个可运行的 Agent。

| # | 章节 | 状态 | 核心代码 | 前置 |
|---|------|------|---------|------|
| 01 | [LLM 基础与函数调用](01-llm-foundation/) | ✅ 已有 | llm_client.js, structured_output.js | — |
| 02 | [Agent 核心执行循环：ReAct 模式](02-react-loop/) | ✅ 已有 | eact_loop.js（原 gent.js） | 01 |
| 03 | [Memory 记忆系统](03-memory-system/) | ✅ 已有 | memory.js | 02 |
| 04 | [Plan Mode：规划与推理](04-plan-mode/) | ✅ 已有 | plan_mode.js, plan_mode_enhanced.js | 02, 03 |

## 第二阶段：架构篇 · 拆引擎

核心目标：从写死的 Demo 升级为可扩展、可维护的模块化架构。

| # | 章节 | 状态 | 核心代码 | 前置 |
|---|------|------|---------|------|
| 05 | [上下文生命周期管理](05-context-lifecycle/) | ✅ 已有 | demo_context_compression.js | 03 |
| 06 | [外部知识接入：RAG 检索系统](06-rag-system/) | ✅ 已有 | ag_agent.js, ector_store.js | 05 |
| 07 | [Harness 执行框架与范式选型](07-harness/) | ✅ 已有 | harness.js, loop_control.js, workflow_engine.js | 02, 05 |
| 08 | [Multi-agent 多智能体系统](08-multi-agent/) | ✅ 已有 | multi_agent_system.js | 04, 07 |

## 第三阶段：扩展篇 · 变强

核心目标：拓展 Agent 的能力边界，从能做事的到能做更多、更安全的事。

| # | 章节 | 状态 | 核心代码 | 前置 |
|---|------|------|---------|------|
| 09 | [Skills/Plugins 工具系统](09-skills-plugins/) | ✅ 已有 | skill_system.js, plugin_system.js | 07 |
| 10 | [MCP 模型上下文协议](10-mcp/) | ✅ 已有 | mcp_client.js | 09 |
| 11 | [安全边界与风险治理](11-security/) | ✅ 已有 | sandbox_executor.js | 09 |

## 第四阶段：工程篇 · 做成产品

核心目标：从玩具 Demo 到生产可用的服务。

| # | 章节 | 状态 | 核心代码 | 前置 |
|---|------|------|---------|------|
| 12 | [后台任务与异步执行](12-background-tasks/) | ✅ 已有 | 	ask_scheduler.js, message_queue.js | 08 |
| 13 | [Agent 评估与测试策略](13-evaluation-testing/) | ✅ 已有 | gent_eval.js, 	ests/ | 02-11 |
| 14 | [可观测性、故障排查与降级兜底](14-observability/) | ✅ 已有 | 	racer.js | 07 |
| 15 | [性能与成本优化](15-cost-optimization/) | ✅ 已有 | 	oken_optimizer.js | 07 |
| 16 | [生产环境部署](16-deployment/) | ✅ 已有 | gent_server.js | 14, 15 |

## 第五阶段：实践篇 · 融会贯通

核心目标：整合所有知识，完成完整项目落地。

| # | 章节 | 状态 | 核心代码 | 前置 |
|---|------|------|---------|------|
| 17 | [LangChain / LangGraph 框架对照](17-langchain-langgraph/) | ✅ 已有 | langchain/ 系列 | 02-08 |
| 18 | [低代码 Agent 平台](18-lowcode-agent/) | ✅ 已有 | Coze / Dify 实践 | — |
| 19 | [典型业务场景 Agent 设计](19-scenario-design/) | 📅 新建 | — | 17 |
| 20 | [综合实践：构建一个生产级 Agent](20-capstone-project/) | 📅 新建 | ull_agent.js | 01-19 |

## 第六阶段：面试冲刺篇

核心目标：临门一脚，集中梳理考点，学完可直接投递面试。

| # | 章节 | 状态 |
|---|------|------|
| 21 | [高频面试题汇总与标准答案](21-interview-qa/) | 📅 新建 |
| 22 | [场景设计题万能答题方法论](22-scenario-method/) | 📅 新建 |
| 23 | [简历优化与自我介绍模板](23-resume-guide/) | 📅 新建 |
| 24 | [手写代码题备战](24-whiteboard-coding/) | 📅 新建 |

## 附录

| # | 章节 | 状态 | 说明 |
|---|------|------|------|
| A | [Claude Code 架构分析系列](a-claude-arch/) | ✅ 已有 | 进阶选读，建议完成前四阶段后阅读 |
| B | [TUI 终端界面实现](b-tui/) | ⏳ 待补充 | — |
| C | [可视化调试与扩展](c-visualization/) | ⏳ 待补充 | — |
| D | [项目配置与 AGENTS.md 规范](d-project-config/) | ⏳ 待补充 | — |
| E | [常见问题与排错手册](e-troubleshooting/) | ✅ 已有 | 持续更新 |

---

## 推荐阅读路线

| 目标 | 推荐路线 |
|------|---------|
| 🐣 快速上手 Agent | 01 → 02 → 03 → 07 |
| 🏗️ 深入架构设计 | 02 → 05 → 07 → 08 |
| 🔌 工具扩展开发 | 02 → 07 → 09 → 10 |
| 🧠 LLM 框架实战 | 02 → 03 → 05 → 07 → 17 |
| ⚙️ 生产落地 | 02 → 07 → 09 → 13 → 14 → 15 → 16 |
| 🎯 面试冲刺 | 01 → 02 → 07 → 08 → 17 → 19 → 21-24 |

---

## 运行代码

`ash
# JavaScript 示例
node minimal_agent/react_loop.js
node minimal_agent/demos/demo_loop_control.js
.\minimal_agent\run_tests.ps1

# Python 示例
cd minimal_agent
python langchain/basic_chain.py
`

*最后更新：2026年7月18日*
