# 第 06 章: 外部知识接入 — RAG 检索系统

> 让 Agent 拥有"外接大脑"：通过检索增强生成（RAG）使 Agent 能访问实时、私有、大规模的领域知识。

## 本章目标

理解 RAG（检索增强生成）的原理，掌握如何让 Agent 接入外部业务知识。

## 前置知识

- 第 02 章：ReAct 循环基础
- 了解 LLM 的基本文本生成原理

## 章节内容

本章包含以下文档，建议按顺序阅读：

| 文件 | 内容 | 适合人群 |
|------|------|---------|
| [01-rag-basics.md](./01-rag-basics.md) | RAG 基础：为什么 LLM 需要 RAG、什么时候用 RAG、最简 RAG 流程 | **所有人，从这里开始** |
| [02-rag-agent-integration.md](./02-rag-agent-integration.md) | 深入技术细节：向量嵌入与 Chunk 策略、向量数据库选择、检索策略（混合搜索/Multi-Query/父文档检索）、重排与召回率优化、RAG 与 Agent 记忆的区别与协作、面试高频问法 | 理解 RAG 基础后阅读 |

## 配套代码

| 文件 | 说明 |
|------|------|
| `minimal_agent/langchain/rag_agent.py` | 基于 LangChain 的 RAG Agent 完整实现（Python），涵盖 Tool 定义、Agent Executor、对话记忆 |

## 本章产出

✅ 理解 RAG 的核心原理和适用场景
✅ 掌握向量嵌入、Chunk 策略、混合检索等关键技术
✅ 能区分 RAG 与 Agent 记忆，并说出它们如何协作
✅ 知道如何优化 RAG 的检索准确率
