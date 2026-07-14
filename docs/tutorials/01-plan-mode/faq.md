# ❓ Plan Mode 实现常见问题解答

## 🤔 我不会写代码，能学会吗？

### 当然能！
- **你不需要精通编程**，只需要理解基本概念
- **我会提供完整的代码**，你只需要复制粘贴
- **遇到问题可以随时问**，我会一步步解释

### 学习方法：
1. **先理解概念**：知道 Plan Mode 是什么，为什么需要它
2. **再看代码**：看看代码是怎么实现的
3. **最后动手**：按照指导一步步操作

## 📝 具体实现步骤

### 第1步：打开你的 agent.js 文件

**位置：** minimal_agent/agent.js

**你会看到：**
`javascript
class MinimalCodingAgent {
    constructor(workingDirectory = '.') {
        this.workingDirectory = path.resolve(workingDirectory);
        this.history = []; // 记录操作历史
    }
    
    // 这里有 executeCommand(), readFile(), writeFile() 方法
}
`

**我的问题：** 你能找到这个文件并打开它吗？

### 第2步：添加 Plan Mode 类

**我会给你这段代码：**
`javascript
class PlanMode {
  constructor(agent) {
    this.agent = agent;
    this.currentPlan = null;
  }
  
  generatePlan(userRequest) {
    // 生成计划的逻辑
  }
  
  displayPlan(plan) {
    // 显示计划的逻辑
  }
  
  executePlan(plan) {
    // 执行计划的逻辑
  }
}
`

**你需要做的：** 把这段代码复制到 agent.js 文件的开头

### 第3步：修改主类

**在 MinimalCodingAgent 类中添加：**
`javascript
constructor(workingDirectory = '.') {
    this.workingDirectory = path.resolve(workingDirectory);
    this.history = [];
    this.planMode = new PlanMode(this);  // 新增这行
}
`

**添加新方法：**
`javascript
async handleRequest(userRequest) {
    // 处理用户请求的逻辑
}
`

### 第4步：测试

**运行测试：**
`ash
node agent.js
`

**输入测试请求：**
`
帮我读取 README.md 文件
`

**预期结果：**
`
收到请求：帮我读取 README.md 文件
📋 执行计划：
任务：帮我读取 README.md 文件
步骤：
  1. 读取文件内容
     预估时间：1秒

是否批准这个计划？
[1] 批准执行
[2] 修改计划
[3] 取消
请选择 (1/2/3): 
`

## 🔧 常见问题

### Q1：代码复制到哪里？
**A1：** 复制到 agent.js 文件的开头，在 class MinimalCodingAgent 之前

### Q2：运行时报错怎么办？
**A2：** 常见错误：
1. **语法错误**：检查括号是否匹配
2. **缺少依赖**：确保安装了 node.js
3. **路径错误**：确保在正确的目录运行

### Q3：Plan Mode 不工作？
**A3：** 检查：
1. 是否正确添加了 PlanMode 类
2. 是否在构造函数中初始化了 planMode
3. 是否正确调用了 handleRequest 方法

### Q4：如何修改计划生成逻辑？
**A4：** 在 nalyzeAndCreateSteps 方法中修改：
`javascript
analyzeAndCreateSteps(userRequest) {
  // 根据不同的请求类型生成不同的步骤
  if (userRequest.includes('读取')) {
    return [{ id: 1, action: '读取文件', ... }];
  }
  // 添加更多类型...
}
`

## 🎯 学习路径建议

### 第一天：理解概念
- [ ] 阅读这个问答文档
- [ ] 理解 Plan Mode 是什么
- [ ] 看看现有 agent.js 的代码

### 第二天：准备环境
- [ ] 确保安装了 Node.js
- [ ] 打开 agent.js 文件
- [ ] 准备好复制代码

### 第三天：添加代码
- [ ] 复制 PlanMode 类
- [ ] 修改主类构造函数
- [ ] 添加 handleRequest 方法

### 第四天：测试运行
- [ ] 运行 agent.js
- [ ] 测试简单请求
- [ ] 查看输出结果

### 第五天：优化完善
- [ ] 根据测试结果调整
- [ ] 添加更多功能
- [ ] 记录学习心得

## 💡 实用技巧

### 1. 代码阅读技巧
- **先看整体结构**：了解类和方法的大致功能
- **再看具体实现**：理解每个方法的作用
- **最后看细节**：注意语法和格式

### 2. 调试技巧
- **打印调试**：在关键位置添加 console.log()
- **逐步测试**：一次只修改一个部分
- **查看错误**：仔细阅读错误信息

### 3. 学习技巧
- **做笔记**：记录学到的知识点
- **多实践**：动手操作比只看更有用
- **问问题**：遇到不懂的及时问

## 🚀 立即行动

### 现在你可以：
1. **打开 agent.js 文件**，看看现有代码
2. **告诉我你看到了什么**，我来帮你理解
3. **准备开始添加 Plan Mode**

### 或者你可以：
1. **先问问题**，确保理解所有概念
2. **制定学习计划**，按步骤进行
3. **找一个安静的时间**，专注学习

## 📞 需要帮助？

### 随时可以：
- **问我任何问题**，无论多简单
- **让我解释代码**，我会用简单语言说明
- **让我帮你调试**，找出问题所在

### 我会：
- **耐心解答**你的每个问题
- **提供完整代码**，你只需复制粘贴
- **一步步指导**你完成整个过程

---

**记住：学习编程最重要的是动手实践！**

**现在，告诉我：**
1. 你打开了 agent.js 文件吗？
2. 你看到了什么？
3. 你有什么问题？

**让我们开始吧！** 🚀
