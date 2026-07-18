# 🛠️ Codex Plan Mode 实践实现指南

## 快速开始

### 第一步：理解核心概念

Plan Mode 的核心是：**先规划，后执行，用户可控**

```
传统模式：用户请求 → 直接执行 → 可能出错
Plan Mode：用户请求 → 制定计划 → 用户确认 → 按计划执行
```

### 第二步：设计数据结构

```javascript
// 计划数据结构
const plan = {
  id: "plan_" + Date.now(),
  description: "任务描述",
  steps: [
    {
      id: "step_1",
      action: "步骤动作",
      description: "详细描述",
      estimatedTime: "5分钟",
      dependencies: [],  // 依赖的步骤ID
      tools: ["read_file"],  // 需要的工具
      risks: ["可能失败"],  // 潜在风险
      successCriteria: "成功标准",
      status: "pending"  // pending, in_progress, completed, failed
    }
  ],
  metadata: {
    createdAt: new Date(),
    estimatedDuration: "30分钟",
    complexity: "medium",
    requiredTools: ["read_file", "write_file"]
  },
  status: "draft"  // draft, approved, executing, completed
};
```

### 第三步：实现计划生成

```python
class PlanGenerator:
    def __init__(self, llm_client):
        self.llm = llm_client
    
    def generate_plan(self, user_request, context):
        # 1. 分析任务
        analysis = self.analyze_task(user_request, context)
        
        # 2. 生成计划
        plan = self.create_plan(analysis)
        
        # 3. 验证计划
        validated_plan = self.validate_plan(plan)
        
        return validated_plan
    
    def analyze_task(self, request, context):
        prompt = f"""
        分析以下任务：
        请求：{request}
        上下文：{context}
        
        返回JSON格式的分析结果：
        {{
            "description": "任务描述",
            "complexity": "low/medium/high",
            "estimated_time": "预估时间",
            "required_tools": ["工具列表"],
            "risks": ["风险列表"]
        }}
        """
        
        response = self.llm.generate(prompt)
        return json.loads(response)
    
    def create_plan(self, analysis):
        prompt = f"""
        根据以下分析创建执行计划：
        {json.dumps(analysis, ensure_ascii=False)}
        
        要求：
        1. 将任务分解为3-7个具体步骤
        2. 每个步骤应该是原子性的
        3. 步骤之间要有清晰的依赖关系
        4. 每个步骤要有明确的成功标准
        
        返回JSON格式的计划：
        {{
            "steps": [
                {{
                    "id": "step_1",
                    "action": "步骤动作",
                    "description": "详细描述",
                    "estimated_time": "时间",
                    "dependencies": [],
                    "tools": ["工具"],
                    "risks": ["风险"],
                    "success_criteria": "成功标准"
                }}
            ]
        }}
        """
        
        response = self.llm.generate(prompt)
        return json.loads(response)
```

### 第四步：实现用户交互

```python
class PlanUI:
    def display_plan(self, plan):
        print(f"\n{'='*50}")
        print(f"📋 计划：{plan['description']}")
        print(f"⏱️ 预估时间：{plan['metadata']['estimatedDuration']}")
        print(f"📊 复杂度：{plan['metadata']['complexity']}")
        print(f"{'='*50}\n")
        
        for i, step in enumerate(plan['steps'], 1):
            print(f"步骤 {i}: {step['action']}")
            print(f"  ⏱️ 时间：{step['estimatedTime']}")
            print(f"  🔧 工具：{', '.join(step['tools'])}")
            print(f"  ⚠️ 风险：{', '.join(step['risks'])}")
            print(f"  ✅ 成功标准：{step['successCriteria']}")
            
            if step['dependencies']:
                print(f"  📝 依赖：步骤 {', '.join(step['dependencies'])}")
            print()
        
        print(f"{'='*50}")
        print("❓ 是否批准此计划？")
        print("[1] 批准执行")
        print("[2] 修改计划")
        print("[3] 取消")
    
    def get_user_choice(self):
        choice = input("请选择 (1/2/3): ")
        return choice
```

### 第五步：实现执行引擎

```python
class PlanExecutor:
    def __init__(self):
        self.tools = {
            'read_file': self.read_file,
            'write_file': self.write_file,
            'run_command': self.run_command
        }
    
    def execute_plan(self, plan):
        print(f"\n🚀 开始执行计划：{plan['description']}\n")
        
        completed_steps = []
        
        for step in plan['steps']:
            # 检查依赖是否满足
            if not self.check_dependencies(step, completed_steps):
                print(f"⚠️ 步骤 {step['id']} 的依赖未满足，跳过")
                continue
            
            # 执行步骤
            print(f"\n🔄 执行步骤：{step['action']}")
            try:
                result = self.execute_step(step)
                
                # 验证结果
                if self.validate_result(step, result):
                    print(f"✅ 步骤 {step['id']} 完成")
                    completed_steps.append(step['id'])
                else:
                    print(f"❌ 步骤 {step['id']} 失败")
                    return self.handle_failure(plan, step, result)
                    
            except Exception as e:
                print(f"❌ 步骤 {step['id']} 出错：{e}")
                return self.handle_error(plan, step, e)
        
        print(f"\n🎉 计划执行完成！")
        return True
    
    def execute_step(self, step):
        # 根据步骤的工具调用相应功能
        results = []
        for tool in step['tools']:
            if tool in self.tools:
                result = self.tools[tool](step)
                results.append(result)
        return results
    
    def check_dependencies(self, step, completed_steps):
        # 检查所有依赖是否已完成
        for dep in step['dependencies']:
            if dep not in completed_steps:
                return False
        return True
```

## 完整示例

```python
# 完整的 Plan Mode 实现
class SimplePlanModeAgent:
    def __init__(self, llm_client):
        self.llm = llm_client
        self.generator = PlanGenerator(llm_client)
        self.ui = PlanUI()
        self.executor = PlanExecutor()
    
    def run(self, user_request):
        # 1. 生成计划
        print("📝 正在分析任务...")
        plan = self.generator.generate_plan(user_request, {})
        
        # 2. 显示计划
        self.ui.display_plan(plan)
        
        # 3. 获取用户确认
        choice = self.ui.get_user_choice()
        
        if choice == '1':
            # 执行计划
            success = self.executor.execute_plan(plan)
            if success:
                print("🎉 任务完成！")
            else:
                print("❌ 任务失败，请重试")
        elif choice == '2':
            # 修改计划
            print("✏️ 请描述需要修改的内容...")
            # 这里可以实现计划修改逻辑
        else:
            print("❌ 计划已取消")

# 使用示例
if __name__ == "__main__":
    agent = SimplePlanModeAgent(your_llm_client)
    agent.run("为这个Python项目添加单元测试")
```

## 进阶功能

### 1. 动态计划调整

```python
def execute_with_adaptation(self, plan):
    for step in plan['steps']:
        result = self.execute_step(step)
        
        if not self.validate_result(step, result):
            # 动态调整计划
            adjusted_plan = self.adjust_plan(plan, step, result)
            return self.execute_with_adaptation(adjusted_plan)
    
    return plan
```

### 2. 并行执行

```python
import asyncio

async def execute_parallel(self, plan):
    # 识别可以并行执行的步骤
    parallel_groups = self.identify_parallel_steps(plan)
    
    for group in parallel_groups:
        # 并行执行同一组的步骤
        tasks = [self.execute_step(step) for step in group]
        results = await asyncio.gather(*tasks)
        
        # 处理结果
        for step, result in zip(group, results):
            self.process_result(step, result)
```

### 3. 错误恢复

```python
def handle_error(self, plan, step, error):
    # 分析错误类型
    error_type = self.classify_error(error)
    
    # 选择恢复策略
    strategy = self.select_recovery_strategy(error_type)
    
    # 执行恢复
    recovery_plan = self.create_recovery_plan(plan, step, strategy)
    
    # 继续执行
    return self.execute_plan(recovery_plan)
```

## 测试用例

```python
# 测试 Plan Mode
def test_plan_mode():
    # 测试用例1：简单任务
    test_cases = [
        {
            "request": "读取文件内容",
            "expected_steps": 1,
            "complexity": "low"
        },
        {
            "request": "重构代码模块",
            "expected_steps": 3,
            "complexity": "medium"
        },
        {
            "request": "添加用户认证系统",
            "expected_steps": 5,
            "complexity": "high"
        }
    ]
    
    for case in test_cases:
        plan = generator.generate_plan(case['request'], {})
        
        # 验证计划
        assert len(plan['steps']) >= case['expected_steps']
        assert plan['metadata']['complexity'] == case['complexity']
        
        print(f"✅ 测试通过：{case['request']}")

if __name__ == "__main__":
    test_plan_mode()
```

## 学习建议

### 1. 从简单开始
- 先实现基本的计划生成
- 然后添加用户交互
- 最后实现执行引擎

### 2. 迭代优化
- 收集用户反馈
- 优化计划生成算法
- 改进用户体验

### 3. 参考实现
- 研究 Codex 的 Plan Mode
- 学习 Claude Code 的实现
- 分析开源项目

### 4. 实践练习
- 为你的 Agent 添加 Plan Mode
- 用不同任务测试
- 记录遇到的问题和解决方案

---

*实践是最好的老师，动手实现才能真正掌握！*
