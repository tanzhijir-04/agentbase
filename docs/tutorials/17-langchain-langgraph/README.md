# LangChain & LangGraph 教程

> 学习日期：2026年7月14日 | 更新日期：2026年7月14日 ![Status](https://img.shields.io/badge/status-learning-yellow)

---

## 关于本教程

本教程从零开始学习 **LangChain** 和 **LangGraph**，这两个是现代 LLM 应用开发的核心框架。
如果你已经在 AI Agent Study 项目中学习了 Plan Mode、Memory 系统和 Multi-agent，那么你已经有
了很好的基础——因为这些概念在 LangChain/LangGraph 中都有对应，现在我们要做的就是把这些
概念**系统化、工程化**。

---

## LangChain vs LangGraph：一句话说清

| | LangChain | LangGraph |
|---|-----------|-----------|
| **本质** | 链式调用框架，把 LLM 调用串联成管道 | 有向图状态机，用节点和边编排复杂流程 |
| **流程** | 线性 DAG（有向无环图） | 可以有循环、分支、条件跳转 |
| **状态** | 用 Chain 对象传参，状态靠外部 Memory | 内建 State 管理，每个节点读写同一状态 |
| **适合** | 清晰固定的流程（翻译、摘要、RAG 问答） | 复杂决策（Agent 循环、多步推理、人机协作） |
| **定位** | LangGraph 的**基础库** | LangChain 的**超集/扩展** |
| **关系** | LangGraph = LangChain + 图状态 + 循环 | |

**简单记忆**：
- LangChain = 像流水线，物料（数据）从一头进，产品从另一头出
- LangGraph = 像状态机，Agent 可以在不同状态间跳转、自循环、等外部输入

---

## 整体学习路径

第一课：LangChain 入门（Chain、Prompt、LLM）
  -> 第二课：LangChain 核心组件（Memory、Retriever、Tool、Agent）
  -> 第三课：LangGraph 入门（StateGraph、Node、Edge）
  -> 第四课：LangGraph 进阶（循环、Human-in-loop、Checkpoint）
  -> 第五课：完整代码实践

---

## 前置学习建议

如果你是第一次接触 AI Agent 开发，建议先完成本项目的前面章节：
- `01-plan-mode/` — 了解 Agent 计划模式
- `02-memory-system/` — 了解 Memory 概念
- `04-multi-agent/` — 了解多 Agent 协调
- `07-loop-control/` — 了解循环/工作流控制

如果你已经有 Python 基础 + 基本 LLM API 使用经验，可以直接从这里开始。

---

## 环境准备

本教程代码使用 Python 3.10+，推荐创建虚拟环境：

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install langchain langchain-openai langgraph
```

如需使用 Anthropic：
```bash
pip install langchain-anthropic
```

如需使用本地模型（Ollama）：
```bash
pip install langchain-ollama
```

> 本项目会配备一个 `minimal_agent/langchain/` 目录来存放所有可运行的示例代码。 ![Status](https://img.shields.io/badge/status-learning-learning)

---

## 目录导航

| # | 文档 | 内容 | 状态 |
|---|------|------|------|
| 01 | [01-langchain-intro.md](01-langchain-intro.md) | LangChain 是什么、Chain、Prompt、LLM 三大基础 | 学习中 |
| 02 | [02-langchain-core.md](02-langchain-core.md) | Memory、RAG、Tool、Agent | 学习中 |
| 03 | [03-langgraph-intro.md](03-langgraph-intro.md) | StateGraph、Node、Edge、状态定义 | 学习中 |
| 04 | [04-langgraph-core.md](04-langgraph-core.md) | 循环、Human-in-loop、Checkpoint、Streaming | 学习中 |
| 05 | [05-practice.md](05-practice.md) | 综合示例：Agent 问答系统 | 学习中 |

---

*文档更新时间：2026年7月14日*
