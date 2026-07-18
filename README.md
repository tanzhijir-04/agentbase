# 🤖 agentbase

![Agentbase Icon](assets/icon.svg)

> AI Agent 知识基地 —— 从零到一构建 Agent 的完整学习体系。
> 覆盖 6 阶段 24 章，配有可运行的 JS/Python 代码实现、单元测试、56 张技术配图和搜索引擎可检索的教程文档。

---

## 🚀 极速开始

```bash
# 在线知识库（推荐）
.\serve.ps1          # 启动本地服务器 → http://localhost:8080

# 或直接打开静态页面
start index.html     # 浏览器打开即可浏览全部文档

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
| 了解项目规范 | [AGENTS.md](AGENTS.md) |

---

## 📁 项目结构

```
agentbase/
├── README.md                           # 项目主页（本文件）
├── AGENTS.md                           # 贡献者指南
├── index.html                          # 📚 在线知识库网页（浏览器打开）
├── serve.ps1                           # 本地开发服务器启动脚本
├── assets/                             # 项目 Logo + 55+ 张技术配图
├── docs/
│   ├── INDEX.md                        # 文档索引（关键词可搜）
│   ├── claude-code-architecture/       # Claude Code 架构深度分析（14 篇）
│   ├── tutorials/                      # 24 章教程
│   │   ├── README.md                   # 总览 + 依赖图 ⭐
│   │   ├── 01-llm-foundation/          # ✅ LLM 基础
│   │   ├── 02-react-loop/              # ✅ ReAct 循环
│   │   ├── 03-memory-system/           # ✅ Memory 系统
│   │   ├── 04-plan-mode/               # ✅ Plan Mode
│   │   ├── 05-context-lifecycle/       # ✅ 上下文生命周期
│   │   ├── 06-rag-system/              # ✅ RAG 检索
│   │   ├── 07-harness/                 # ✅ Harness 执行框架
│   │   ├── 08-multi-agent/             # ✅ Multi-agent
│   │   ├── 09-skills-plugins/          # ✅ Skills/Plugins
│   │   ├── 10-mcp/                     # ✅ MCP 协议
│   │   ├── 11-security/                # ✅ 安全与沙箱
│   │   ├── 12-background-tasks/        # ✅ 后台任务
│   │   ├── 13-evaluation-testing/      # ✅ 评估与测试
│   │   ├── 14-observability/           # ✅ 可观测性
│   │   ├── 15-cost-optimization/       # ✅ 成本优化
│   │   ├── 16-deployment/              # ✅ 生产部署
│   │   ├── 17-langchain-langgraph/     # ✅ LangChain/LangGraph
│   │   ├── 18-lowcode-agent/           # ✅ 低代码平台（Coze/Dify）
│   │   ├── 19-scenario-design/         # ✅ 场景设计
│   │   ├── 20-capstone-project/        # ✅ 综合实践
│   │   ├── 21-interview-qa/            # ✅ 面试题
│   │   ├── 22-scenario-method/         # ✅ 场景方法论
│   │   ├── 23-resume-guide/            # ✅ 简历优化
│   │   ├── 24-whiteboard-coding/       # ✅ 手写代码
│   │   ├── a-claude-arch/              # 附录 A：Claude Code 架构
│   │   ├── d-project-config/           # 附录 D：项目配置
│   │   ├── e-troubleshooting/          # 附录 E：排错手册
│   │   └── _archive/                   # 旧版本归档
│   └── git/                            # Git 配置和指南
├── minimal_agent/                      # Agent 代码实现
│   ├── agent.js / agent.py             # v1.0（JS + Python）
│   ├── agent_v2.js                     # v2.0（含 Memory）
│   ├── memory.js / memory.json         # Memory 系统
│   ├── plan_mode.js / plan_mode_enhanced.js   # Plan Mode
│   ├── multi_agent_system.js           # Multi-agent 系统
│   ├── message_queue.js                # 消息队列
│   ├── task_scheduler.js               # 任务调度器
│   ├── loop_control.js / workflow_engine.js    # 循环控制 + DAG 引擎
│   ├── skill_system.js / plugin_system.js       # 技能/插件系统
│   ├── langchain/                      # LangChain/LangGraph 代码
│   │   ├── basic_chain.py              # 最简单的 Chain
│   │   ├── rag_agent.py                # RAG + Memory Agent
│   │   └── langgraph_agent.py          # LangGraph + Human-in-loop
│   ├── demos/                          # 可运行演示
│   ├── tests/                          # 测试（全部通过 ✅）
│   └── run_tests.ps1                   # 一键运行测试
└── assets/                             # 项目 Logo + 配图生成脚本
```

## 📊 学习进度

### 第一阶段：基础篇

| # | 章节 | 状态 |
|---|------|------|
| 01 | LLM 基础与函数调用 | ✅ |
| 02 | Agent 核心执行循环：ReAct 模式 | ✅ |
| 03 | Memory 记忆系统 | ✅ |
| 04 | Plan Mode：规划与推理 | ✅ |

### 第二阶段：架构篇

| # | 章节 | 状态 |
|---|------|------|
| 05 | 上下文生命周期管理 | ✅ |
| 06 | 外部知识接入：RAG 检索系统 | ✅ |
| 07 | Harness 执行框架与范式选型 | ✅ |
| 08 | Multi-agent 多智能体系统 | ✅ |

### 第三阶段：扩展篇

| # | 章节 | 状态 |
|---|------|------|
| 09 | Skills/Plugins 工具系统 | ✅ |
| 10 | MCP 模型上下文协议 | ✅ |
| 11 | 安全边界与风险治理 | ✅ |

### 第四阶段：工程篇

| # | 章节 | 状态 |
|---|------|------|
| 12 | 后台任务与异步执行 | ✅ |
| 13 | Agent 评估与测试策略 | ✅ |
| 14 | 可观测性、故障排查与降级兜底 | ✅ |
| 15 | 性能与成本优化 | ✅ |
| 16 | 生产环境部署 | ✅ |

### 第五阶段：实践篇

| # | 章节 | 状态 |
|---|------|------|
| 17 | LangChain / LangGraph 框架对照 | ✅ |
| 18 | 低代码 Agent 平台（Coze/Dify） | ✅ |
| 19 | 典型业务场景 Agent 设计 | ✅ |
| 20 | 综合实践：构建生产级 Agent | ✅ |

### 第六阶段：面试冲刺篇

| # | 章节 | 状态 |
|---|------|------|
| 21 | 高频面试题汇总与标准答案 | ✅ |
| 22 | 场景设计题万能答题方法论 | ✅ |
| 23 | 简历优化与自我介绍模板 | ✅ |
| 24 | 手写代码题备战 | ✅ |

**图例：** ✅ 完成（文档 + 代码 + 测试就绪）

---

## 🎯 推荐阅读路线

| 兴趣方向 | 推荐顺序 |
|---------|---------|
| 🐣 Agent 入门 | 01 → 02 → 03 → 07 |
| 🏗️ 架构进阶 | 02 → 05 → 07 → 08 |
| 🔌 扩展开发 | 02 → 07 → 09 → 10 |
| 🧠 LLM 框架 | 02 → 03 → 05 → 07 → 17 |
| ⚙️ 生产落地 | 02 → 07 → 09 → 13 → 14 → 15 → 16 |
| 🎯 面试冲刺 | 01 → 02 → 07 → 08 → 17 → 19 → 21-24 |

不确定的可以先看 [教程总览](docs/tutorials/README.md) 的依赖关系图。

---

## 🛠️ 常用命令

```bash
# 启动知识库网页
.\serve.ps1                     # 然后访问 http://localhost:8080
start index.html                # 或直接打开静态页

# 运行代码
node minimal_agent/agent.js
node minimal_agent/demos/demo_loop_control.js

# 运行全部测试
.\minimal_agent\run_tests.ps1

# Python LangChain
cd minimal_agent
python langchain/basic_chain.py
python langchain/rag_agent.py
python langchain/langgraph_agent.py
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

*更新时间：2026年7月18日*
