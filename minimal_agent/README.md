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
 ├── loop_control.js                 # Loop/Workflow控制核心
 ├── workflow_engine.js              # DAG工作流引擎
 ├── skill_system.js                 # 技能系统（Skills）
 ├── skill_discovery.js              # 技能发现（Discovery）
 ├── plugin_system.js                # 插件系统（Plugins）
 ├── agent_analysis.md               # Agent分析文档
 ├── AGENT_V2_README.md              # v2.0功能说明
 ├── README.md                       # 本说明文件
 ├── langchain/                      # LangChain/LangGraph 示例
 │   ├── basic_chain.py              # 最简单的 Chain
 │   ├── rag_agent.py                # RAG + Memory Agent
 │   └── langgraph_agent.py          # LangGraph + Human-in-loop
 ├── demos/                          # 演示文件
 │   ├── demo_regex.js               # 正则表达式演示
 │   ├── demo_language_detection.js  # 语言检测演示
 │   ├── demo_context_compression.js # 上下文压缩演示
 │   ├── demo_multi_agent.js         # Multi-agent 协作演示
 │   ├── demo_skills_plugins.js      # Skills/Plugins 演示
 │   └── demo_loop_control.js        # Loop/Workflow控制演示
 ├── tests/                          # 测试文件
 │   ├── test_agent_v2.js            # v2.0测试
 │   ├── test_memory.js              # Memory测试
 │   ├── test_plan_mode.js           # Plan Mode基础版测试
 │   ├── test_enhanced_plan_mode.js  # Plan Mode增强版测试
 │   ├── test_multi_agent.js         # Multi-agent系统测试
 │   ├── test_skill_system.js        # 技能系统测试
 │   ├── test_skill_discovery.js     # 技能发现测试
 │   ├── test_plugin_system.js       # 插件系统测试
 │   ├── test_loop_control.js        # Loop控制测试 ✅ 28/28
 │   └── test_workflow_engine.js     # 工作流引擎测试 ✅ 10/10
 ├── run_tests.ps1                   # 一键运行所有测试
 └── run_multi_agent_demo.ps1        # 一键运行Multi-agent演示
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

### 4. 运行Loop/Workflow控制
```bash
# 综合演示
node demos/demo_loop_control.js

# 独立模块
node loop_control.js
node workflow_engine.js
```

### 5. 运行测试
```bash
# 运行所有测试
node tests/test_agent_v2.js
node tests/test_memory.js
node tests/test_plan_mode.js
node tests/test_enhanced_plan_mode.js
node tests/test_multi_agent.js
node tests/test_loop_control.js
node tests/test_workflow_engine.js
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

### Day 7: Loop/Workflow控制
- **loop_control.js** - Loop/Workflow控制核心（循环控制、重试、断路器、速率限制、状态机）
- **workflow_engine.js** - DAG工作流引擎（依赖解析、并行执行、条件分支）
- **demos/demo_loop_control.js** - 综合演示（6个模块）
- **功能**: 循环控制、重试策略、断路器模式、速率限制、状态机、工作流编排
- **目标**: 理解Agent执行的稳定性保障和流程编排

## 🎯 核心功能

### 1. Agent基础能力
```javascript
agent.executeCommand("ls -la");
agent.readFile("test.txt");
agent.writeFile("output.txt", "Hello World");
```

### 2. Plan Mode
```javascript
const plan = await agent.generatePlan("实现用户登录功能");
const confirmed = await agent.confirmPlan(plan);
await agent.executePlan(plan);
```

### 3. Memory系统
```javascript
memory.store("user_preference", "dark_mode");
const preference = memory.retrieve("user_preference");
const relatedMemories = memory.getRelated("login");
```

### 4. Multi-agent系统
```javascript
const system = new MultiAgentSystem();
system.registerAgent(new Coordinator());
system.registerAgent(new Worker("worker1", ["coding"]));
system.createTask({ id: "task1", name: "实现登录功能", requiredSkills: ["coding"] });
```

### 5. Loop/Workflow控制
```javascript
// 循环控制
const loop = new LoopController({ maxIterations: 100, timeout: 30000 });
const result = await loop.run(async (iteration) => { /* 迭代逻辑 */ });

// 重试策略
const retry = new RetryStrategy({ maxRetries: 3, backoffType: "exponential" });
const retryResult = await retry.execute(async () => { /* 可能失败的操作 */ });

// 断路器
const breaker = new CircuitBreaker({ failureThreshold: 5 });
try { await breaker.call(async () => { /* 受保护的操作 */ }); } catch (e) {}

// 速率限制
const limiter = new RateLimiter({ tokensPerSecond: 10 });
await limiter.schedule(async () => { /* 受限操作 */ }, { timeout: 5000 });

// 状态机
const sm = new StateMachine({ initialState: "idle", states: { ... } });
sm.trigger("start");

// 工作流引擎
const wf = new WorkflowEngine("pipeline");
wf.addNode("step1", { execute: async (ctx) => {} });
const wfResult = await wf.run();
```

## 🧪 测试

### 运行所有测试
```bash
node tests/test_agent_v2.js
node tests/test_memory.js
node tests/test_plan_mode.js
node tests/test_multi_agent.js
node tests/test_loop_control.js
node tests/test_workflow_engine.js
```

### 测试覆盖
- ✅ Agent基础功能
- ✅ Memory存储和检索
- ✅ Plan Mode生成和执行
- ✅ Multi-agent通信和协调
- ✅ 任务调度和分配
- ✅ **循环控制（28测试）**
- ✅ **工作流引擎（10测试）**

## 📖 文档

### 教程文档
- [教程总览](../docs/tutorials/README.md)
- [Plan Mode指南](../docs/tutorials/01-plan-mode/)
- [Memory系统](../docs/tutorials/02-memory-system/)
- [Multi-agent管理](../docs/tutorials/04-multi-agent/)
- [Loop/Workflow控制](../docs/tutorials/07-loop-control/)

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
- **Loop/Workflow**: 循环控制和流程编排

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
