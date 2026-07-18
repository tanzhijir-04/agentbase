# 📚 AI Agent 学习知识库 — 文档索引

> 六个阶段、24 章、5 个附录。按阶段关键词快速定位所有文档。

---

## 🗂️ 章节目录

### 第一阶段：基础篇 · 跑起来

| # | 章节 | 状态 | 前置 | 文件 |
|---|------|------|------|------|
| 01 | LLM 基础与函数调用 | ✅ 已有 | — | README.md |
| 02 | Agent 核心执行循环：ReAct 模式 | ✅ 已有 | 01 | README.md, react_loop_guide.md（从原 loop_control 拆分） |
| 03 | Memory 记忆系统 | ✅ 已有 | 02 | README.md, day2_memory_system.md |
| 04 | Plan Mode：规划与推理 | ✅ 已有 | 02, 03 | README.md, analysis.md, complete.md, faq.md, implementation_guide.md, practice.md |

### 第二阶段：架构篇 · 拆引擎

| # | 章节 | 状态 | 前置 | 文件 |
|---|------|------|------|------|
| 05 | 上下文生命周期管理 | ✅ 已有 | 03 | README.md, context_compression.md |
| 06 | 外部知识接入：RAG 检索系统 | ✅ 已有 | 05 | README.md |
| 07 | Harness 执行框架与范式选型 | ✅ 已整合 | 02, 05 | README.md, 01-05 (5 篇), loop_control_guide.md, 对应代码 |
| 08 | Multi-agent 多智能体系统 | ✅ 已精简 | 04, 07 | README.md, multi_agent_management_guide.md |

### 第三阶段：扩展篇 · 变强

| # | 章节 | 状态 | 前置 | 文件 |
|---|------|------|------|------|
| 09 | Skills/Plugins 工具系统 | ✅ 已有 | 07 | README.md, plugins_skills_system.md |
| 10 | MCP 模型上下文协议 | ✅ 已有 | 09 | README.md |
| 11 | 安全边界与风险治理 | ✅ 已有 | 09 | README.md, sandbox_guide.md |

### 第四阶段：工程篇 · 做成产品

| # | 章节 | 状态 | 前置 | 文件 |
|---|------|------|------|------|
| 12 | 后台任务与异步执行 | ✅ 已有 | 08 | README.md |
| 13 | Agent 评估与测试策略 | ✅ 已有 | 02-11 | README.md |
| 14 | 可观测性、故障排查与降级兜底 | ✅ 已有 | 07 | README.md |
| 15 | 性能与成本优化 | ✅ 已有 | 07 | README.md |
| 16 | 生产环境部署 | ✅ 已有 | 14, 15 | README.md |

### 第五阶段：实践篇 · 融会贯通

| # | 章节 | 状态 | 前置 | 文件 |
|---|------|------|------|------|
| 17 | LangChain / LangGraph 框架对照 | ✅ 已有 | 02-08 | README.md, 01-05 (5 篇) |
| 18 | 低代码 Agent 平台 | ✅ 已有 | — | README.md, 01-07 (7 篇) |
| 19 | 典型业务场景 Agent 设计 | 📅 新建 | 17 | README.md |
| 20 | 综合实践：构建一个生产级 Agent | 📅 新建 | 01-19 | README.md |

### 第六阶段：面试冲刺篇

| # | 章节 | 状态 |
|---|------|------|
| 21 | 高频面试题汇总与标准答案 | 📅 新建 |
| 22 | 场景设计题万能答题方法论 | 📅 新建 |
| 23 | 简历优化与自我介绍模板 | 📅 新建 |
| 24 | 手写代码题备战 | 📅 新建 |

### 附录

| # | 章节 | 状态 | 文件 |
|---|------|------|------|
| A | Claude Code 架构分析系列 | ✅ 已有 | README.md, 01-overview.md (14 篇系列) |
| B | TUI 终端界面实现 | ⏳ 待补充 | — |
| C | 可视化调试与扩展 | ⏳ 待补充 | — |
| D | 项目配置与 AGENTS.md 规范 | ⏳ 待补充 | — |
| E | 常见问题与排错手册 | ✅ 已有 | README.md |

---

## 🔑 关键词索引

| 关键词 | 章节 |
|--------|------|
| Agent 循环 / ReAct | 02, 07 |
| 函数调用 / Tool Call | 01, 02 |
| 记忆 / Memory | 03 |
| Token / 上下文 | 05, 15 |
| RAG / 知识检索 | 06 |
| Harness / 执行引擎 | 07 |
| Plan Mode / 规划 | 04 |
| Multi-agent / 多 Agent | 08 |
| Skills / Plugins / 扩展 | 09 |
| MCP 协议 | 10 |
| 安全 / 沙箱 / Prompt 注入 | 11 |
| 后台任务 / 异步 | 12 |
| 评估 / 测试 / 幻觉 | 13 |
| 可观测性 / Tracing / 故障 | 14 |
| 性能 / 成本 / Token 优化 | 15 |
| 部署 / 服务化 | 16 |
| LangChain / LangGraph | 17 |
| 低代码 / Coze / Dify | 18 |
| 场景设计 | 19 |
| 综合实践 / 项目 | 20 |
| 面试冲刺 / 简历 | 21-24 |
| Claude Code 架构 | A |

---

## 🚀 快速开始

`ash
# 跑通第一个 Agent
node minimal_agent/agent.js

# 运行全部测试
.\minimal_agent\run_tests.ps1

# Python LangChain 示例
cd minimal_agent
python langchain/basic_chain.py
`

*索引更新时间：2026年7月18日*
