# 🎯 给你的 Agent 添加 Plan Mode - 简单易懂的实现计划

## 📝 什么是 Plan Mode？（用生活中的例子解释）

### 想象一下你去超市购物：

**没有 Plan Mode 的情况：**
`
你：我要买东西
Agent：好的，我直接去买
（结果：可能忘记买牛奶，可能多买了不需要的东西）
`

**有 Plan Mode 的情况：**
`
你：我要买东西
Agent：好的，我先制定购物清单：
  1. 先检查冰箱里有什么（2分钟）
  2. 列出需要买的东西（3分钟）
  3. 去超市购买（15分钟）
  4. 回家整理（5分钟）
  
你：看起来不错，批准执行！
Agent：好的，开始执行...
`

**这就是 Plan Mode 的核心：先计划，后执行，你来决定！**

## 🔍 为什么你的 Agent 需要 Plan Mode？

### 现在的情况（没有 Plan Mode）：
`
用户：帮我重构这个代码
Agent：好的，我直接开始改
（可能改错地方，可能漏掉重要文件，用户不知道在做什么）
`

### 有了 Plan Mode 之后：
`
用户：帮我重构这个代码
Agent：我分析了你的请求，这是我的计划：
  步骤1：分析现有代码结构（5分钟）
  步骤2：设计重构方案（8分钟）
  步骤3：实施重构（15分钟）
  步骤4：测试验证（5分钟）
  
用户：批准！
Agent：开始执行步骤1...
`

## 🛠️ 简单实现计划（4个步骤）

### 第一步：理解现有代码（10分钟）

**目标：** 看懂你的 agent.js 是怎么工作的

**你需要做的：**
1. 打开 minimal_agent/agent.js 文件
2. 找到 MinimalCodingAgent 这个类
3. 理解它有什么功能：
   - xecuteCommand() - 执行命令
   - eadFile() - 读文件
   - writeFile() - 写文件

**我会帮你：** 解释代码的每个部分

### 第二步：设计 Plan Mode 的数据结构（15分钟）

**目标：** 设计计划的"格式"

**想象一下：** 计划就像一个购物清单

`javascript
// 一个简单的计划长这样：
const plan = {
  description: "重构用户认证模块",  // 要做什么
  steps: [  // 具体步骤
    {
      id: 1,
      action: "分析现有代码",
      time: "5分钟",
      status: "待执行"
    },
    {
      id: 2, 
      action: "设计新架构",
      time: "10分钟",
      status: "待执行"
    }
  ]
};
`

**我会帮你：** 设计适合你 agent 的计划格式

### 第三步：添加 Plan Mode 功能（30分钟）

**目标：** 让 agent 能够生成和执行计划

**添加的新功能：**

1. **计划生成功能**
   - 用户说"帮我重构代码"
   - agent 分析后生成计划
   - 显示给用户看

2. **用户确认功能**
   - 显示计划后问用户："批准吗？"
   - 用户可以批准、修改或取消

3. **计划执行功能**
   - 按照计划一步步执行
   - 显示每一步的进度
   - 遇到问题时调整计划

**我会帮你：** 写具体的代码实现

### 第四步：测试和优化（20分钟）

**目标：** 确保 Plan Mode 正常工作

**测试场景：**
1. 简单任务：读取一个文件
2. 中等任务：修改几个文件
3. 复杂任务：重构代码模块

**优化点：**
1. 计划显示更清晰
2. 错误处理更完善
3. 用户体验更好

## 📋 具体实现细节

### 1. 新增的 Plan Mode 类

`javascript
class PlanMode {
  constructor(agent) {
    this.agent = agent;  // 关联到你的agent
    this.currentPlan = null;
  }
  
  // 生成计划
  generatePlan(userRequest) {
    console.log("📝 正在分析你的请求...");
    
    // 这里用简单的规则生成计划
    // 实际项目中可以用AI来生成
    const plan = {
      description: userRequest,
      steps: this.analyzeAndCreateSteps(userRequest),
      status: "draft"  // 草稿状态
    };
    
    return plan;
  }
  
  // 显示计划给用户
  displayPlan(plan) {
    console.log("\n📋 执行计划：");
    console.log(任务：);
    console.log("步骤：");
    
    plan.steps.forEach((step, index) => {
      console.log(  . );
      console.log(     预估时间：);
    });
    
    console.log("\n❓ 是否批准这个计划？");
    console.log("[1] 批准执行");
    console.log("[2] 修改计划");
    console.log("[3] 取消");
  }
  
  // 执行计划
  async executePlan(plan) {
    console.log("\n🚀 开始执行计划...");
    
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      console.log(\n🔄 执行步骤 : );
      
      try {
        // 根据步骤类型执行相应操作
        const result = await this.executeStep(step);
        console.log(✅ 步骤  完成);
        
      } catch (error) {
        console.log(❌ 步骤  失败: );
        // 这里可以添加错误处理逻辑
      }
    }
    
    console.log("\n🎉 计划执行完成！");
  }
}
`

### 2. 修改你的 Agent 主类

`javascript
// 在你的 MinimalCodingAgent 类中添加 Plan Mode 功能
class MinimalCodingAgent {
  constructor(workingDirectory = '.') {
    this.workingDirectory = path.resolve(workingDirectory);
    this.history = [];
    this.planMode = new PlanMode(this);  // 新增：Plan Mode 实例
  }
  
  // 新增：处理用户请求（带 Plan Mode）
  async handleRequest(userRequest) {
    console.log(\n收到请求：);
    
    // 1. 生成计划
    const plan = this.planMode.generatePlan(userRequest);
    
    // 2. 显示计划
    this.planMode.displayPlan(plan);
    
    // 3. 等待用户确认
    const userChoice = await this.getUserChoice();
    
    if (userChoice === '1') {
      // 4. 执行计划
      await this.planMode.executePlan(plan);
    } else if (userChoice === '2') {
      console.log("✏️ 请描述需要修改的内容...");
      // 这里可以添加修改计划的逻辑
    } else {
      console.log("❌ 计划已取消");
    }
  }
  
  // 获取用户输入
  getUserChoice() {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('请选择 (1/2/3): ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }
}
`

### 3. 简单的计划生成逻辑

`javascript
// 根据用户请求生成计划
analyzeAndCreateSteps(userRequest) {
  const steps = [];
  
  // 分析请求类型，生成相应步骤
  if (userRequest.includes('读取') || userRequest.includes('read')) {
    steps.push({
      id: 1,
      action: '读取文件内容',
      estimatedTime: '1秒',
      type: 'read_file'
    });
    
  } else if (userRequest.includes('写入') || userRequest.includes('write')) {
    steps.push(
      {
        id: 1,
        action: '分析写入需求',
        estimatedTime: '2秒',
        type: 'analyze'
      },
      {
        id: 2,
        action: '写入文件内容',
        estimatedTime: '1秒',
        type: 'write_file'
      }
    );
    
  } else if (userRequest.includes('重构') || userRequest.includes('refactor')) {
    steps.push(
      {
        id: 1,
        action: '分析现有代码结构',
        estimatedTime: '5分钟',
        type: 'analyze'
      },
      {
        id: 2,
        action: '设计重构方案',
        estimatedTime: '8分钟',
        type: 'design'
      },
      {
        id: 3,
        action: '实施重构',
        estimatedTime: '15分钟',
        type: 'implement'
      },
      {
        id: 4,
        action: '测试验证',
        estimatedTime: '5分钟',
        type: 'test'
      }
    );
  }
  
  return steps;
}
`

## 🎮 测试场景

### 场景1：简单任务
`
用户：帮我读取 README.md 文件
Agent：好的，我生成了计划：
  步骤1：读取文件内容（1秒）
  
是否批准？[1/2/3]
用户：1
Agent：正在执行... 完成！
`

### 场景2：中等任务
`
用户：帮我创建一个新的测试文件
Agent：这是我的计划：
  步骤1：分析测试需求（2秒）
  步骤2：创建测试文件（1秒）
  步骤3：添加测试用例（3秒）
  
是否批准？[1/2/3]
用户：1
Agent：开始执行...
`

### 场景3：复杂任务
`
用户：帮我重构这个模块
Agent：这是详细的计划：
  步骤1：分析现有代码结构（5分钟）
  步骤2：设计重构方案（8分钟）
  步骤3：实施重构（15分钟）
  步骤4：测试验证（5分钟）
  
是否批准？[1/2/3]
用户：1
Agent：开始执行步骤1...
`

## 📚 学习要点

### 1. 核心概念
- **计划驱动**：先思考再行动
- **用户可控**：用户拥有最终决定权
- **透明可视**：执行过程清晰可见

### 2. 实现技巧
- **简单开始**：先实现基本功能
- **迭代优化**：根据反馈改进
- **错误处理**：考虑各种情况

### 3. 用户体验
- **清晰展示**：让用户看懂计划
- **简单交互**：批准/修改/取消
- **实时反馈**：显示执行进度

## 🚀 下一步行动

### 立即行动（今天）：
1. **阅读这个计划**，确保理解每个部分
2. **打开 agent.js 文件**，看看现有代码
3. **告诉我你的问题**，我来帮你解答

### 明天开始：
1. **第一步**：我们一起看懂现有代码
2. **第二步**：设计 Plan Mode 的数据结构
3. **第三步**：添加 Plan Mode 功能
4. **第四步**：测试和优化

## 💡 重要提醒

### 你不需要：
- 精通编程
- 记住所有语法
- 一次性写完所有代码

### 你需要：
- 理解每个步骤的目的
- 跟着我的指导一步步做
- 遇到问题及时问

### 我会帮你：
- 解释每个代码部分的作用
- 提供完整的代码示例
- 解答你的所有问题
- 帮你调试和测试

## 🎯 预期成果

完成后，你的 agent 将拥有：

1. **Plan Mode 功能**
   - 能够生成执行计划
   - 显示计划给用户
   - 等待用户确认
   - 按计划执行

2. **更好的用户体验**
   - 用户知道 agent 在做什么
   - 用户可以控制执行过程
   - 执行过程透明可见

3. **更智能的行为**
   - 先分析再执行
   - 遇到问题能调整
   - 提供更好的服务

---

**准备好开始了吗？让我们一步步来！**

*第一步：告诉我你对这个计划有什么问题？*
