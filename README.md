<div align="center">
  <img src="asset/icon.svg" alt="AI-Agent-Study Logo" width="100" height="100">
  <h1>AI Agent 学习懒人包</h1>
  24 个主题 · 6 个阶段 · 可运行代码 · 中文文档 · <a href="https://tanzhijir-04.github.io/AI-Agent-Study/">在线知识库</a>
</div>

<div align="center">
<a href="https://tanzhijir-04.github.io/AI-Agent-Study/"><img src="https://img.shields.io/badge/在线知识库-访问-blue?style=flat-square"></a>
<a href="https://space.bilibili.com/15586839"><img src="https://img.shields.io/badge/B 站-作者主页-fb7299?style=flat-square"></a>
</div>

## 这个仓库是做什么的

一个面向 **普通开发者转型 Agent 开发工程师 / 大模型应用工程师** 的完整学习路径。

从最基础的 LLM 调用和 ReAct 循环开始，一路深入到 Harness 框架、Multi-agent 协作、RAG 检索、MCP 协议、生产部署，最后以面试冲刺收尾。每个主题都有中文文档、直接能跑的 JS/Python 代码、配套测试，以及**面试高频考点**标注。

代码不需要 GPU 或 API Key，装个 Node.js 就能跑。

**谁会用得上：**

| 如果你…… | 可以从这里下手 |
|---|---|
| 刚接触 Agent，想理解 AI Agent 是什么 | 看[教程总览](docs/tutorials/README.md)，从第一阶段开始 |
| 写代码但没碰过 LLM 相关的开发 | minimal_agent/ 下面的代码都是 Node.js 直接跑的 |
| 主要用 Python | 翻 [LangChain/LangGraph 专题](docs/tutorials/17-langchain-langgraph/) 和 [Python 示例](minimal_agent/langchain/) |
| 准备面试 Agent 开发岗 | 从[教程总览](docs/tutorials/README.md)看第一阶段快速上手，随后专攻第六阶段 |
| 想拿这个当素材讲课 | [在线知识库](https://tanzhijir-04.github.io/AI-Agent-Study/) 直接打开就能当课件 |

## 学习路径

本知识库按 **六个阶段递进** 编排，从零基础>到面试冲刺：

`
第一阶段：基础篇 · 跑起来（第 01-04 章）
  写个 Agent 先看看长什么样

第二阶段：架构篇 · 拆引擎（第 05-08 章）
  理解 Agent 内部是怎么工作的

第三阶段：扩展篇 · 变强（第 09-11 章）
  让 Agent 能做更多、更安全的事

第四阶段：工程篇 · 做成产品（第 12-16 章）
  从玩具 Demo 到生产可用

第五阶段：实践篇 · 融会贯通（第 17-20 章）
  框架对照 + 场景实战 + 完整项目

第六阶段：面试冲刺篇（第 21-24 章）
  学完直接去面试
`

详细学习路径和章节依赖关系见 [教程总览文档](docs/tutorials/README.md)。

## 极速开始

`ash
git clone https://github.com/tanzhijir-04/AI-Agent-Study.git
cd AI-Agent-Study

node minimal_agent/agent.js

# Windows 运行测试
.\minimal_agent\run_tests.ps1

# Python
cd minimal_agent
python langchain/basic_chain.py
`

## 项目骨架

`
AI-Agent-Study/
├── docs/
│   ├── INDEX.md              # 文档索引（24 章 + 5 附录）
│   └── tutorials/            # 六个阶段、24 章教程 + 附录
│       ├── README.md         # 教程总览（推荐从这个文件开始）
│       ├── 01-llm-foundation/
│       ├── ...
│       └── 24-whiteboard-coding/
├── minimal_agent/
│   ├── agent.js              # 基础 Agent（即将重构为 react_loop.js）
│   ├── agent_v2.js           # 带 Memory 的 v2
│   ├── plan_mode.js          # Plan Mode
│   ├── multi_agent_system.js
│   ├── loop_control.js + workflow_engine.js
│   ├── langchain/            # Python 示例
│   ├── demos/
│   └── tests/
└── asset/
    └── icon.svg
`

完整结构见 [AGENTS.md](AGENTS.md)。

## 学习进度

| 阶段 | 章节 | 状态 |
|------|------|------|
| 基础篇 | 01 LLM 基础 → 04 Plan Mode | ✅ 4/4 章已就绪（01 图文完成，02 重构完成） |
| 架构篇 | 05 上下文 → 08 Multi-agent | ✅ 4/4 章已就绪（05-06 图文完成，07-08 已整合） |
| 扩展篇 | 09 Skills → 11 安全 | ✅ 3/3 章已就绪（09-11 图文完成） |
| 工程篇 | 12 后台 → 16 部署 | ✅ 5/5 章已就绪（12-16 图文完成） |
| 实践篇 | 17 LangChain → 20 综合实践 | ✅ 2/4 章已就绪（17 图文完成，18 图文完成，19-20 框架就绪） |
| 面试篇 | 21 面试题 → 24 手写代码 | 📅 4 章均为新建 |
| 附录 | A Claude Arch → E 排错手册 | ✅ 1/5 章已就绪（E 新建） |

✅ 已有可读内容 · 🔄 重构/扩展中 · 📅 待写

## 推荐资源

- [Claude Code 文档](https://docs.anthropic.com/claude-code)
- [OpenAI Codex 文档](https://platform.openai.com/docs/codex)
- [MCP 协议](https://modelcontextprotocol.io)
- [LangChain 文档](https://python.langchain.com/)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)

---

<div align="center">

有问题开 Issue，想一起写发 PR。<br>
<a href="https://space.bilibili.com/15586839">B站主页</a> · <a href="https://tanzhijir-04.github.io/AI-Agent-Study/">在线知识库</a>

</div>

*2026年7月18日 · 结构升级：24 章 6 阶段 + 面试冲刺*
*2026年7月18日 · 图文并茂：55+ 张配图覆盖全部 16 个已就绪章节*
