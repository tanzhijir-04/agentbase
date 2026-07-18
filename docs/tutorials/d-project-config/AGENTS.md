# 📝 AI Agent 学习项目 - 贡献者指南

 > **更新日期**: 2026年7月15日

---

## 📁 项目结构

```
AI-Agent-Study/
├── README.md                           # 项目主页
├── AGENTS.md                           # 本文件（贡献者指南）
├── docs/                               # 文档目录
│   ├── INDEX.md                        # 文档索引
│   ├── tutorials/                      # 教程和学习指南
│   │   ├── README.md                   # 教程总览
│   │   ├── 01-plan-mode/               # ✅ Plan Mode
│   │   ├── 02-memory-system/           # ✅ Memory系统
│   │   ├── 03-context-compression/     # ✅ 上下文压缩
│   │   ├── 04-multi-agent/             # ✅ Multi-agent管理
│   │   ├── 05-background-tasks/        # 📅 后台任务
│   │   ├── 06-plugins/                 # ✅ 插件系统
│   │   ├── 07-loop-control/            # ✅ 循环控制
│   │   ├── 08-sandbox/                 # 📅 沙箱环境
│   │   ├── 09-mcp/                     # 📅 MCP配置
│   │   ├── 10-tui/                     # 📅 TUI优化
│   │   ├── 11-visualization/           # 📅 可视化
 │   │   ├── 12-langchain-langgraph/     # 🔄 LangChain/LangGraph
 │   │   ├── 13-lowcode-agent/           # ✅ 低代码Agent
 │   │   └── 14-harness/                 # ✅ Harness执行框架
│   └── git/                            # Git相关
└── minimal_agent/                      # Agent代码实现
    ├── agent_v2.js                     # v2.0主程序（含Memory）
    ├── agent.js                        # v1.0基础版
    ├── agent.py                        # Python版本
    ├── memory.js                       # Memory系统
    ├── memory.json                     # 记忆存储文件
    ├── plan_mode.js                    # Plan Mode基础版
    ├── plan_mode_enhanced.js           # Plan Mode增强版
    ├── multi_agent_system.js           # Multi-agent系统
    ├── message_queue.js                # 消息队列系统
    ├── task_scheduler.js               # 任务调度器
    ├── multi_agent_collaboration.js    # Multi-agent协作示例
    ├── loop_control.js                 # Loop/Workflow控制核心
    ├── workflow_engine.js              # DAG工作流引擎
    ├── agent_analysis.md               # Agent分析文档
    ├── AGENT_V2_README.md              # v2.0功能说明
    ├── README.md                       # Agent目录说明
    ├── langchain/                      # LangChain/LangGraph 代码示例
    │   ├── basic_chain.py              # 最简单的 Chain
    │   ├── rag_agent.py                # RAG + Memory Agent
    │   └── langgraph_agent.py          # LangGraph + Human-in-loop
    ├── demos/                          # 演示文件
    │   ├── demo_regex.js               # 正则表达式演示
    │   ├── demo_language_detection.js  # 语言检测演示
    │   └── demo_loop_control.js        # Loop/Workflow控制演示
    └── tests/                          # 测试文件
        ├── test_agent_v2.js            # v2.0测试
        ├── test_memory.js              # Memory测试
        ├── test_plan_mode.js           # Plan Mode测试
        ├── test_enhanced_plan_mode.js  # Plan Mode增强版测试
        ├── test_multi_agent.js         # Multi-agent系统测试
        ├── test_loop_control.js        # Loop控制测试
        └── test_workflow_engine.js     # 工作流引擎测试
```

---

## 📋 内容规范

### 添加新资源

1. **确定分类**：
   - 教程 → `docs/tutorials/`
   - Plan Mode → `docs/tutorials/01-plan-mode/`
   - Agent代码 → `minimal_agent/`
   - 演示文件 → `minimal_agent/demos/`
   - 测试文件 → `minimal_agent/tests/`
   - Python代码 → `minimal_agent/langchain/`

2. **命名规范**：
   - 使用小写字母和下划线
   - 描述性名称：`memory_system_guide.md`
   - 日期版本：`tutorial_2026.md`

3. **更新索引**：
   - 添加新文件后更新 `docs/INDEX.md`
   - 重大变更更新本文件 `AGENTS.md`

---

## 🎯 学习进度

### 已完成

- [x] Day 1 (7月10日): 环境搭建 + 最小Agent实现
- [x] Day 2 (7月11日): Plan Mode学习和实现
- [x] Day 3 (7月12日): Memory系统 + 语言识别
- [x] Day 4 (7月12日): Multi-agent管理 + 上下文压缩
- [x] Day 6 (7月12日): Skills/Plugins系统
- [x] Day 7 (7月14日): Loop/Workflow控制 + 综合实践
 - [x] Day 8 (7月14日): LangChain/LangGraph 框架学习 + 文档 + 代码实现 + Sandbox 概念学习
 - [x] Day 11 (7月15日): Harness 执行框架概念研究 + 5 篇文档

### 进行中

- [ ] Day 5: Background Tasks
- [ ] Day 9: Sandbox + MCP + TUI + 可视化 (深入编写中)
- [ ] Day 10: LangGraph 生产化

---

## 💡 贡献流程

1. 创建内容遵循命名规范
2. 放置到正确目录
3. 确保Markdown格式正确
4. 更新 `docs/INDEX.md`
5. 提交前测试代码示例

---

 *指南更新时间：2026年7月15日*



