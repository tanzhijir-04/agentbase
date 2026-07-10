# ⚡ 一周速成计划：现代Agent特性

> 目标：用一周时间掌握现代Agent的核心特性，能够理解并实现基本功能

---

## 📅 每日学习计划

### Day 1：Plan Mode（计划模式）
**目标**：让agent先思考再行动

**学习内容**：
- 理解Plan Mode的作用
- 实现简单的计划生成器
- 实现计划展示和确认

**实践任务**：
```javascript
// 实现一个简单的PlanMode
class PlanMode {
    analyzeRequest(userInput) {
        // 解析用户意图
        return {
            goal: userInput,
            steps: this.generateSteps(userInput)
        };
    }
    
    generateSteps(goal) {
        // 根据目标生成步骤
        return [
            { id: 1, description: "分析需求", status: "pending" },
            { id: 2, description: "执行任务", status: "pending" },
            { id: 3, description: "验证结果", status: "pending" }
        ];
    }
    
    showPlan(plan) {
        console.log("📋 执行计划：");
        plan.steps.forEach(step => {
            console.log(`  ${step.id}. ${step.description} [${step.status}]`);
        });
    }
}
```

**学习时间**：2-3小时

---

### Day 2：Memory系统（记忆系统）
**目标**：让agent记住重要信息

**学习内容**：
- 短期记忆：当前对话历史
- 长期记忆：持久化存储

**实践任务**：
```javascript
// 实现基本的Memory系统
class Memory {
    constructor() {
        this.shortTerm = [];  // 对话历史
        this.longTerm = {};   // 持久化记忆
    }
    
    // 短期记忆：添加对话
    addMessage(role, content) {
        this.shortTerm.push({ role, content, time: Date.now() });
        if (this.shortTerm.length > 50) {
            this.shortTerm.shift(); // 保留最近50条
        }
    }
    
    // 长期记忆：记住用户偏好
    remember(key, value) {
        this.longTerm[key] = value;
        this.saveToFile();
    }
    
    // 长期记忆：回忆
    recall(key) {
        return this.longTerm[key];
    }
    
    // 保存到文件
    saveToFile() {
        fs.writeFileSync('memory.json', JSON.stringify(this.longTerm));
    }
    
    // 从文件加载
    loadFromFile() {
        try {
            this.longTerm = JSON.parse(fs.readFileSync('memory.json'));
        } catch {}
    }
}
```

**学习时间**：2-3小时

---

### Day 3：Loop控制 + Context Compression
**目标**：防止无限循环，处理长对话

**学习内容**：
- 循环检测机制
- 上下文压缩策略

**实践任务**：
```javascript
// 1. 循环检测
class LoopDetector {
    constructor(maxIterations = 50) {
        this.iterations = 0;
        this.history = [];
        this.maxIterations = maxIterations;
    }
    
    check(action) {
        this.iterations++;
        this.history.push(action);
        
        // 检查是否超过限制
        if (this.iterations >= this.maxIterations) {
            throw new Error('达到最大迭代次数');
        }
        
        // 检查是否陷入循环
        const recent = this.history.slice(-5);
        const unique = new Set(recent);
        if (unique.size < 3) {
            throw new Error('检测到循环，停止执行');
        }
    }
}

// 2. 简单的上下文压缩
function compressContext(messages, maxMessages = 20) {
    if (messages.length <= maxMessages) {
        return messages;
    }
    
    // 保留系统消息和最近的消息
    const systemMsgs = messages.filter(m => m.role === 'system');
    const recentMsgs = messages.slice(-10);
    
    // 对中间部分生成摘要
    const middleMsgs = messages.slice(systemMsgs.length, -10);
    const summary = generateSummary(middleMsgs);
    
    return [...systemMsgs, { role: 'system', content: summary }, ...recentMsgs];
}
```

**学习时间**：2-3小时

---

### Day 4：Background Tasks（后台任务）
**目标**：处理长时间运行的任务

**学习内容**：
- 任务队列设计
- 进度监控

**实践任务**：
```javascript
// 简单的任务队列
class TaskQueue {
    constructor() {
        this.queue = [];
        this.running = null;
    }
    
    addTask(name, taskFn) {
        this.queue.push({ name, taskFn, status: 'pending' });
        this.processNext();
    }
    
    async processNext() {
        if (this.running || this.queue.length === 0) return;
        
        this.running = this.queue.shift();
        this.running.status = 'running';
        
        try {
            await this.running.taskFn();
            this.running.status = 'completed';
        } catch (error) {
            this.running.status = 'failed';
            this.running.error = error.message;
        }
        
        this.running = null;
        this.processNext();
    }
    
    getStatus() {
        return {
            pending: this.queue.length,
            running: this.running ? 1 : 0
        };
    }
}
```

**学习时间**：2-3小时

---

### Day 5：Skills/Plugins基础
**目标**：理解插件系统的设计

**学习内容**：
- 插件结构设计
- 插件注册和执行

**实践任务**：
```javascript
// 简单的插件管理器
class PluginManager {
    constructor() {
        this.plugins = new Map();
    }
    
    register(plugin) {
        this.plugins.set(plugin.name, plugin);
        console.log(`✅ 插件 "${plugin.name}" 已注册`);
    }
    
    async execute(pluginName, action, params) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            throw new Error(`插件 "${pluginName}" 不存在`);
        }
        return await plugin[action](params);
    }
    
    list() {
        return Array.from(this.plugins.keys());
    }
}

// 示例插件
const webSearchPlugin = {
    name: 'web-search',
    description: '网络搜索',
    async search(query) {
        // 实现搜索逻辑
        return `搜索结果: ${query}`;
    }
};
```

**学习时间**：2-3小时

---

### Day 6：TUI优化 + 可视化
**目标**：改善用户体验

**学习内容**：
- 彩色输出
- 进度条
- 简单的日志系统

**实践任务**：
```javascript
// 彩色输出
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(type, message) {
    const icons = {
        success: `${colors.green}✅`,
        error: `${colors.red}❌`,
        warning: `${colors.yellow}⚠️`,
        info: `${colors.blue}ℹ️`
    };
    console.log(`${icons[type]} ${message}${colors.reset}`);
}

// 进度条
function progressBar(current, total, width = 30) {
    const percent = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r[${bar}] ${percent}%`);
}

// 使用示例
log('success', '任务完成');
log('error', '发生错误');
log('info', '正在处理...');

for (let i = 0; i <= 100; i++) {
    progressBar(i, 100);
    await sleep(50);
}
```

**学习时间**：2-3小时

---

### Day 7：综合实践 + 复习
**目标**：整合所学知识，构建完整的小项目

**学习内容**：
- 复习所有特性
- 综合应用

**实践任务**：
构建一个"智能任务助手"，包含：
- Plan Mode：分析任务并生成计划
- Memory：记住用户偏好
- Loop控制：防止无限循环
- TUI：友好的界面显示

```javascript
class SmartAssistant {
    constructor() {
        this.planMode = new PlanMode();
        this.memory = new Memory();
        this.loopDetector = new LoopDetector();
    }
    
    async handleRequest(userInput) {
        // 1. 检查记忆中的偏好
        const preferences = this.memory.recall('preferences') || {};
        
        // 2. 生成计划
        const plan = this.planMode.analyzeRequest(userInput);
        this.planMode.showPlan(plan);
        
        // 3. 执行计划（带循环检测）
        for (const step of plan.steps) {
            this.loopDetector.check(step.description);
            await this.executeStep(step);
            log('success', `完成: ${step.description}`);
        }
        
        // 4. 记住这次交互
        this.memory.addMessage('user', userInput);
        this.memory.addMessage('assistant', '任务完成');
    }
}
```

**学习时间**：3-4小时

---

## 📊 学习进度检查表

### Day 1：Plan Mode
- [ ] 理解Plan Mode的作用
- [ ] 实现基本的计划生成
- [ ] 实现计划展示

### Day 2：Memory系统
- [ ] 实现短期记忆（对话历史）
- [ ] 实现长期记忆（文件存储）
- [ ] 测试记忆功能

### Day 3：Loop控制 + Compression
- [ ] 实现循环检测
- [ ] 实现上下文压缩
- [ ] 测试边界情况

### Day 4：Background Tasks
- [ ] 实现任务队列
- [ ] 实现进度监控
- [ ] 测试并发任务

### Day 5：Skills/Plugins
- [ ] 理解插件架构
- [ ] 实现插件管理器
- [ ] 创建一个示例插件

### Day 6：TUI + 可视化
- [ ] 实现彩色输出
- [ ] 实现进度条
- [ ] 实现日志系统

### Day 7：综合实践
- [ ] 复习所有特性
- [ ] 构建综合项目
- [ ] 测试和调试

---

## 💡 学习建议

### 1. 每天2-3小时
- 1小时学习概念
- 1-2小时动手实践

### 2. 代码优先
- 每学一个概念，立即写代码验证
- 不要只看不练

### 3. 简单实现
- 先实现最简单的版本
- 理解核心思想后再完善

### 4. 参考开源项目
- Claude Code
- Codex
- 看看别人怎么实现的

### 5. 记录笔记
- 记录学到的知识点
- 记录遇到的问题和解决方案

---

## 🎯 一周后的目标

完成这一周学习后，你应该能够：

1. ✅ 理解现代Agent的核心特性
2. ✅ 实现基本的Plan Mode和Memory系统
3. ✅ 理解如何防止无限循环
4. ✅ 知道如何设计插件系统
5. ✅ 能够改善Agent的用户体验
6. ✅ 具备进一步学习的基础

---

## 🚀 立即开始

**今天就开始Day 1的学习！**

1. 阅读 `MODERN_AGENT_FEATURES.md` 中的Plan Mode部分
2. 创建一个新的文件 `plan_mode.js`
3. 实现一个简单的PlanMode类
4. 测试你的实现

---

*记住：一周时间很紧，重在理解核心思想，不必追求完美实现。*
