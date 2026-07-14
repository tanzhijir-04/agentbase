# 11 - 可视化和可观测性

> 让 Agent 行为可追踪 ![Status](https://img.shields.io/badge/status-learning-yellow)

## 📚 文档列表

| 文件 | 说明 |
|------|------|
| [README.md](README.md) | 本文件（快速概览） |

## 🎯 核心概念

### 为什么需要可观测性？

AI Agent 系统本质上是一个**非确定性系统**——同一个输入可能产生不同的执行路径。没有可观测性，你无法回答：

- Agent 为什么做出这个决定？
- 哪个工具调用导致了错误？
- Agent 的"思考"过程是什么样的？
- 性能瓶颈在哪里（LLM 调用耗时？工具执行耗时？）

### 三大可观测性支柱

| 支柱 | 说明 | Agent 场景对应 |
|------|------|---------------|
| **Logs（日志）** | 离散事件的记录 | Agent 的每一步操作 + LLM 调用 |
| **Metrics（指标）** | 聚合统计数据 | 调用次数、延迟、Token 消耗 |
| **Traces（追踪）** | 请求端到端链路 | 一次 Agent 执行的全链路追踪 |

### Agent 可视化技术

| 技术 | 用途 | 工具 |
|------|------|------|
| 思维链可视化 | 展示 Agent 推理步骤 | Mermaid 流程图 |
| DAG 工作流图 | 展示任务依赖和执行顺序 | workflow_engine.js 的 toMermaid() |
| 实时状态面板 | 监控运行中的 Agent | blessed / dashboard |
| Token 消耗图 | 统计每次 LLM 调用的 Token | 柱状图 / 饼图 |
| 调用瀑布图 | 展示工具调用的耗时分布 | 时序条形图 |

### 与项目其他章节的集成

| 章节 | 集成点 |
|------|--------|
| 03-Context Compression | 可视化压缩前后的 Token 节省量 |
| 04-Multi-agent | 多 Agent 的可视化协作图 |
| 07-Loop Control | LoopController 状态追踪的可视化 |
| 10-TUI | 作为 TUI 面板的一部分展示图表 |

## 💡 学习要点

- [x] 理解可观测性的三大支柱（Logs / Metrics / Traces）
- [x] 掌握 Agent 可视化的常用技术和工具
- [x] 了解各章节间的可观测性集成点
- [ ] 实现 Agent 运行的日志收集器
- [ ] 生成 DAG 工作流的 Mermaid 可视化图
- [ ] 展示 Token 消耗和调用延迟的统计面板
- [ ] 集成到 TUI 中作为实时状态视图

---

*更新时间：2026年7月14日*
