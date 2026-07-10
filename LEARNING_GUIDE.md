# 🎓 AI Agent 学习路径指南

根据教程，这是你的AI Agent学习之旅。让我们一步步来。

## 📍 当前位置：第一节课

你已经完成了**第一节课**的核心要求：
- ✅ 手写了一个最小的coding agent
- ✅ 实现了两个核心功能：terminal执行和文件IO
- ✅ 理解了agent的基本工作循环

## 🚀 下一步学习计划

### 阶段1：理解你的Agent（现在）
**目标**：深入理解你创建的agent是如何工作的

1. **阅读代码**（minimal_agent/agent.js）
   - 理解`executeCommand`函数
   - 理解`readFile`和`writeFile`函数
   - 理解主循环如何解析用户输入

2. **实验和修改**
   - 尝试修改agent，添加新功能
   - 例如：添加一个`listFiles`命令
   - 例如：添加命令历史记录功能

### 阶段2：学习现代Agent特性（下一步）
**目标**：了解现代agent的关键特性

根据教程，你需要学习以下特性：

#### 1. Plan Mode（计划模式）
```python
# 伪代码示例
def plan_and_execute(user_request):
    # 1. 分析用户请求
    plan = create_plan(user_request)
    
    # 2. 展示计划给用户
    show_plan(plan)
    
    # 3. 执行计划
    for step in plan:
        execute(step)
        show_progress()
```

#### 2. Memory系统（记忆）
- **短期记忆**：当前对话的上下文
- **长期记忆**：跨会话的知识存储

#### 3. Context Auto Compression（上下文压缩）
- 当对话太长时自动压缩
- 保留重要信息，删除冗余内容

#### 4. Multi-agent管理
- 教程警告：multi-agent不适合编程任务
- 适合场景：大规模并行任务（Map-Reduce模式）

### 阶段3：研究开源实现（进阶）
**目标**：学习最好的开源agent实现

推荐研究的项目：
1. **Claude Code**（Anthropic）
2. **Codex**（OpenAI）
3. **Open Code**（开源社区）
4. **Kimi Code**（月之暗面）

学习要点：
- TUI（终端用户界面）设计
- Sandbox环境控制
- MCP（Model Context Protocol）配置

## 📝 学习任务清单

### 任务1：扩展你的Agent（1-2天）
- [ ] 添加`listFiles`命令
- [ ] 添加`deleteFile`命令
- [ ] 添加命令历史记录功能
- [ ] 添加错误处理改进

### 任务2：实现Plan Mode（2-3天）
- [ ] 创建简单的计划生成器
- [ ] 实现计划展示功能
- [ ] 实现计划执行功能

### 任务3：实现Memory系统（3-5天）
- [ ] 实现短期记忆（对话历史）
- [ ] 实现长期记忆（文件存储）
- [ ] 实现记忆检索功能

### 任务4：研究开源实现（1周）
- [ ] 阅读Claude Code源码
- [ ] 理解TUI设计模式
- [ ] 学习Sandbox环境控制

## 💡 教程关键提醒

### 关于模型选择
> "对于大部分的工作而言，买质朴moon shot就是约战面，买阿里，买deep sick，买小米快手mini max基业形成"

**建议**：使用性价比高的国产模型（80-90分模型），而不是昂贵的高端模型。

### 关于Multi-agent
> "multi agent它不太适合于编程问题"

**警告**：
- ❌ 不要用于并行编程
- ❌ 不要用于公司架构模拟
- ✅ 适合大规模并行任务（Map-Reduce）

### 关于学习顺序
> "从马车蒸汽汽车开始，你已经实现了第一节课。你要和看一看和今天最好的这些开源的实现你有哪些差距。"

**建议**：先完成基础，再研究高级实现。

## 🎯 立即行动

### 今天的任务
1. **运行你的agent**：
   ```bash
   cd minimal_agent
   node agent.js
   ```

2. **测试所有功能**：
   - `exec dir` - 列出文件
   - `write test.txt` - 创建文件
   - `read test.txt` - 读取文件
   - `history` - 查看历史

3. **思考和计划**：
   - 你的agent还缺少什么功能？
   - 如何改进用户体验？
   - 如何添加新命令？

### 本周的任务
1. 扩展agent功能（添加2-3个新命令）
2. 阅读教程中提到的现代特性
3. 研究一个开源agent项目

## 📚 推荐资源

### 教程和文档
- [Claude Code官方文档](https://docs.anthropic.com/claude-code)
- [OpenAI Codex文档](https://platform.openai.com/docs/codex)
- [LangChain Agent教程](https://python.langchain.com/docs/modules/agents/)

### 开源项目
- [Claude Code](https://github.com/anthropics/claude-code)
- [Open Interpreter](https://github.com/OpenInterpreter/open-interpreter)
- [GPT Engineer](https://github.com/gpt-engineer-org/gpt-engineer)

## 🎉 恭喜！

你已经完成了AI Agent学习的第一步！

记住教程的话：
> "把这些核心功能首先是看懂，第二是想明白，设计明白，第三是把它实现出来。把这三步实现完了之后，你就是一个合格的一个在agent领域里面入门的一个大学生。"

**你已经入门了！** 继续前进，学习更多现代特性，最终你将能够创建出像Claude Code、Codex一样强大的agent。

---

*下一步：扩展你的agent功能，然后学习Plan Mode！*
