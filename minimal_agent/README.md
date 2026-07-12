# Minimal Coding Agent - AI Agent学习项目

这是AI Agent学习项目的代码实现目录，包含从基础Agent到Multi-agent系统的完整学习路径。

## 🎯 项目结构

```
minimal_agent/
├── agent.js                        # v1.0基础版Agent
├── agent_v2.js                     # v2.0主程序（含Memory）
├── agent.py                        # Python版本Agent
├── memory.js                       # Memory系统实现
├── memory.json                     # 记忆存储文件
├── plan_mode.js                    # Plan Mode基础版
├── plan_mode_enhanced.js           # Plan Mode增强版
├── multi_agent_system.js           # Multi-agent系统
├── message_queue.js                # 消息队列系统
├── task_scheduler.js               # 任务调度器
├── multi_agent_collaboration.js    # Multi-agent协作示例
├── agent_analysis.md               # Agent分析文档
├── AGENT_V2_README.md              # v2.0功能说明
├── README.md                       # 本说明文件
├── demos/                          # 演示文件
│   ├── demo_regex.js               # 正则表达式演示
│   └── demo_language_detection.js  # 语言检测演示
└── tests/                          # 测试文件
    ├── test_agent_v2.js            # v2.0测试
    ├── test_memory.js              # Memory测试
    ├── test_plan_mode.js           # Plan Mode测试
    ├── test_enhanced_plan_mode.js  # Plan Mode增强版测试
    └── test_multi_agent.js         # Multi-agent系统测试
```

## 🚀 快速开始

### 1. 运行基础Agent
```bash
node agent.js
```

### 2. 运行v2.0 Agent（含Memory）
```bash
node agent_v2.js
```

### 3. 运行Multi-agent系统
```bash
# 基础Multi-agent系统
node multi_agent_system.js

# 完整协作示例
node multi_agent_collaboration.js
```

### 4. 运行测试
```bash
# 运行所有测试
node tests/test_agent_v2.js
node tests/test_memory.js
node tests/test_plan_mode.js
node tests/test_enhanced_plan_mode.js
node tests/test_multi_agent.js
```

## 📚 学习路径

### Day 1: 基础Agent
- **agent.js** - 最小Agent实现
- **功能**: Terminal执行 + 文件IO读写
- **目标**: 理解Agent的核心循环

### Day 2: Plan Mode
- **plan_mode.js** - Plan Mode基础版
- **plan_mode_enhanced.js** - Plan Mode增强版
- **功能**: 任务规划、用户确认、计划执行
- **目标**: 让Agent先思考再行动

### Day 3: Memory系统
- **memory.js** - Memory系统实现
- **功能**: 长期记忆、上下文管理、记忆检索
- **目标**: 让Agent能够记住和回忆信息

### Day 4: Multi-agent管理
- **multi_agent_system.js** - 基础Multi-agent系统
- **message_queue.js** - 消息队列系统
- **task_scheduler.js** - 任务调度器
- **multi_agent_collaboration.js** - 完整协作示例
- **功能**: 多个Agent协作、任务分配、通信协调
- **目标**: 理解多Agent系统的架构和实现

## 🎯 核心功能

### 1. Agent基础能力
```javascript
// 执行shell命令
agent.executeCommand("ls -la");

// 读取文件
agent.readFile("test.txt");

// 写入文件
agent.writeFile("output.txt", "Hello World");
```

### 2. Plan Mode
```javascript
// 生成执行计划
const plan = await agent.generatePlan("实现用户登录功能");

// 用户确认计划
const confirmed = await agent.confirmPlan(plan);

// 按计划执行
await agent.executePlan(plan);
```

### 3. Memory系统
```javascript
// 存储记忆
memory.store("user_preference", "dark_mode");

// 检索记忆
const preference = memory.retrieve("user_preference");

// 获取相关记忆
const relatedMemories = memory.getRelated("login");
```

### 4. Multi-agent系统
```javascript
// 创建系统
const system = new MultiAgentSystem();

// 注册Agent
system.registerAgent(new Coordinator());
system.registerAgent(new Worker('worker1', ['coding']));

// 创建任务
system.createTask({
  id: 'task1',
  name: '实现登录功能',
  requiredSkills: ['coding']
});
```

## 🧪 测试

### 运行所有测试
```bash
# 基础测试
node tests/test_agent_v2.js

# Memory测试
node tests/test_memory.js

# Plan Mode测试
node tests/test_plan_mode.js

# Multi-agent测试
node tests/test_multi_agent.js
```

### 测试覆盖
- ✅ Agent基础功能
- ✅ Memory存储和检索
- ✅ Plan Mode生成和执行
- ✅ Multi-agent通信和协调
- ✅ 任务调度和分配

## 📖 文档

### 教程文档
- [教程总览](../docs/tutorials/README.md)
- [Plan Mode指南](../docs/tutorials/01-plan-mode/)
- [Memory系统](../docs/tutorials/02-memory-system/)
- [Multi-agent管理](../docs/tutorials/04-multi-agent/)

### 代码文档
- [v2.0功能说明](AGENT_V2_README.md)
- [Agent分析文档](agent_analysis.md)

## 🎓 学习要点

### 1. 理解Agent架构
- 从简单到复杂的学习路径
- 每个组件的职责和接口
- 组件间的协作方式

### 2. 掌握核心概念
- **Plan Mode**: 任务规划和执行
- **Memory**: 长期记忆和上下文管理
- **Multi-agent**: 多Agent协作和协调

### 3. 实践和扩展
- 运行示例代码理解原理
- 修改代码尝试不同功能
- 扩展实现自己的功能

## 🚀 下一步

完成基础学习后，可以：

1. **深入研究开源实现**
   - Claude Code
   - Codex Agent
   - 其他AI Agent框架

2. **扩展功能**
   - 添加更多Agent类型
   - 实现分布式Multi-agent系统
   - 集成机器学习优化

3. **构建实际应用**
   - 代码生成和审查
   - 自动化测试
   - 项目管理

---

*这是AI Agent学习项目的代码实现目录。通过实践这些代码，你将掌握构建现代AI Agent系统的核心技能。*
