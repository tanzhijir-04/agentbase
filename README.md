# 🤖 AI Agent Study

> 从零开始学习AI Agent开发的完整学习资源库

## 📚 项目简介

本仓库包含AI Agent学习的完整资料，从基础的最小Agent实现到现代Agent特性的深入学习。

## 🎯 学习路径

### 第一阶段：基础入门
- [x] 手写最小Coding Agent
- [x] 理解Agent核心循环

### 第二阶段：现代特性学习
- [x] Plan Mode（计划模式）
- [x] Memory系统（记忆系统）
- [x] Context Compression（上下文压缩）
- [x] Multi-agent管理
- [ ] Background Tasks（后台任务）
- [ ] Skills/Plugins系统
- [ ] Loop/Workflow控制
- [ ] Sandbox环境控制
- [ ] MCP配置
- [ ] TUI优化
- [ ] 可视化和可观测性

## 📁 项目结构

```
AI-Agent-Study/
├── README.md                    # 项目主页
├── AGENTS.md                    # 贡献指南
├── docs/                        # 文档目录
│   ├── INDEX.md                 # 文档索引
│   ├── tutorials/               # 教程和指南
│   │   ├── README.md            # 教程总览
│   │   ├── 01-plan-mode/        # ✅ Plan Mode
│   │   ├── 02-memory-system/    # ✅ Memory系统
│   │   ├── 03-context-compression/ # ✅ 上下文压缩
│   │   ├── 04-multi-agent/      # ✅ Multi-agent管理
│   │   ├── 05-background-tasks/ # 📅 后台任务
│   │   ├── 06-plugins/          # 📅 插件系统
│   │   ├── 07-loop-control/     # 📅 循环控制
│   │   ├── 08-sandbox/          # 📅 沙箱环境
│   │   ├── 09-mcp/              # 📅 MCP配置
│   │   ├── 10-tui/              # 📅 TUI优化
│   │   └── 11-visualization/    # 📅 可视化
│   ├── plan-mode/               # Plan Mode 专题
│   └── git/                     # Git 相关
├── minimal_agent/               # Agent 代码
│   ├── agent.js                 # JavaScript版本（推荐）
│   ├── agent_v2.js              # v2.0主程序（含Memory）
│   ├── agent.py                 # Python版本
│   ├── memory.js                # Memory系统
│   ├── plan_mode.js             # Plan Mode基础版
│   ├── plan_mode_enhanced.js    # Plan Mode增强版
│   ├── multi_agent_system.js    # Multi-agent系统
│   ├── message_queue.js         # 消息队列系统
│   ├── task_scheduler.js        # 任务调度器
│   ├── multi_agent_collaboration.js # Multi-agent协作示例
│   ├── demos/                   # 演示文件
│   │   └── demo_multi_agent.js  # Multi-agent演示
│   └── tests/                   # 测试文件
│       └── test_multi_agent.js  # Multi-agent测试
└── .vscode/                     # VS Code 配置
    └── settings.json
```

## 🚀 快速开始

### 1. 运行最小Agent

```bash
cd minimal_agent
node agent.js
```

### 2. 运行Multi-agent系统

```bash
cd minimal_agent

# 基础Multi-agent系统
node multi_agent_system.js

# 完整协作示例
node multi_agent_collaboration.js

# Multi-agent演示
node demos/demo_multi_agent.js
```

### 3. 运行测试

```bash
cd minimal_agent/tests
node test_multi_agent.js
```

### 4. 尝试基本命令

```
🤖 Agent> exec echo "Hello, Agent!"
🤖 Agent> write test.txt
🤖 Agent> read test.txt
🤖 Agent> plan 帮我读取 README.md 文件
🤖 Agent> history
🤖 Agent> quit
```

## 📖 学习资料

### 文档导航
- **[文档索引](docs/INDEX.md)** - 完整的文档分类和导航
- **[教程目录](docs/tutorials/)** - 所有教程和指南
- **[Plan Mode专题](docs/plan-mode/)** - Plan Mode 完整学习资料
- **[Git相关](docs/git/)** - Git设置和配置

### 核心文档
- **[学习路径指南](docs/tutorials/learning_guide.md)** - 完整学习路径
- **[现代Agent特性](docs/tutorials/modern_agent_features.md)** - 现代Agent特性详解
- **[一周速成计划](docs/tutorials/one_week_plan.md)** - 一周速成计划

### Multi-agent相关
- **[Multi-agent管理指南](docs/tutorials/04-multi-agent/multi_agent_management_guide.md)** - 完整教程
- **[学习总结](docs/tutorials/04-multi-agent/multi_agent_learning_summary.md)** - 学习成果

### 快速入门
- **[快速开始](docs/tutorials/quick_start.md)** - 快速开始指南
- **[学习总结](docs/tutorials/summary.md)** - 学习成果总结

### 原始教程
- **[峰哥AI学习视频](docs/tutorials/lidang_tutorial.md)** - 原始教程文字版（2026年）

## 🎓 学习目标

完成本课程后，你将能够：

1. ✅ 理解Agent的核心工作原理
2. ✅ 实现基本的Coding Agent
3. ✅ 掌握现代Agent的关键特性（Plan Mode）
4. ✅ 理解Multi-agent系统的架构和实现
5. ✅ 具备进一步深入学习的基础

## 💡 教程关键点

### 关于模型选择
> "对于大部分的工作而言，买质朴moon shot就是约战面，买阿里，买deep sick，买小米快手mini max基业形成"

**建议**：使用性价比高的国产模型（80-90分模型）

### 关于Multi-agent
> "multi agent它不太适合于编程问题"

**警告**：
- ❌ 不要用于并行编程
- ❌ 不要用于公司架构模拟
- ✅ 适合大规模并行任务（Map-Reduce）

### 关于学习顺序
> "从马车蒸汽汽车开始，你已经实现了第一节课。你要和看一看和今天最好的这些开源的实现你有哪些差距。"

**建议**：先完成基础，再研究高级实现

## 🚀 Multi-agent系统特性

### 核心组件
1. **Agent系统** - 基础Agent实现和管理
2. **消息队列** - Agent间通信机制
3. **任务调度器** - 智能任务分配和调度
4. **协作系统** - 完整的多Agent协作示例

### 架构模式
- **主从模式** - Master负责协调，Slave执行任务
- **对等模式** - 所有Agent地位平等，自主协商
- **层次模式** - 多层级管理结构
- **黑板模式** - 共享数据空间，Agent自主读写

### 学习成果
- 理解Multi-agent系统的必要性
- 掌握不同架构模式的特点
- 实现基础的消息通信系统
- 创建智能的任务调度器
- 构建完整的协作示例

## 📚 推荐资源

### 官方文档
- [Claude Code文档](https://docs.anthropic.com/claude-code)
- [OpenAI Codex文档](https://platform.openai.com/docs/codex)
- [MCP协议文档](https://modelcontextprotocol.io)

### 开源项目
- [Claude Code](https://github.com/anthropics/claude-code)
- [Open Interpreter](https://github.com/OpenInterpreter/open-interpreter)
- [GPT Engineer](https://github.com/gpt-engineer-org/gpt-engineer)

## 🤝 贡献

欢迎提交Issue和Pull Request！

详见 [AGENTS.md](AGENTS.md) 了解贡献指南。

## 📄 许可证

MIT License

---

*记住：这是你的AI Agent学习之旅的第一步。完成它，你就入门了！*
