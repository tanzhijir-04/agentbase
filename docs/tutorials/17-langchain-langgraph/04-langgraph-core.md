# LangGraph 进阶：Human-in-loop、Checkpoint、Streaming

> 适合读者：已理解 StateGraph 基本机制，想做出生产级 Agent

---

## 1. Human-in-loop（人机协作）

### 1.1 为什么需要 Human-in-loop？

在完全自动化的 Agent 中，LLM 可能会：
- 执行危险操作（删除文件、写数据库）
- 做出错误的判断
- 不确定该用哪个参数

**Human-in-loop** 就是在关键节点**暂停**，等人确认后再继续。

### 1.2 基本机制：interrupt

LangGraph 提供了 `interrupt` 函数，在执行到某个节点时暂停图，
等待外部输入后再恢复：

```python
from langgraph.graph import StateGraph, END
from langgraph.types import interrupt

def human_approval_step(state: AgentState) -> dict:
    """等待人工确认"""
    action = state["proposed_action"]

    # 暂停执行，返回数据给前端等待用户确认
    decision = interrupt({
        "action": action,
        "question": f"确认执行以下操作？\n{action}"
    })

    # 用户确认后，继续执行
    if decision == "approve":
        return {"approved": True}
    else:
        return {"approved": False}

# 注册节点
graph.add_node("approval", human_approval_step)
graph.add_edge("propose_action", "approval")
graph.add_conditional_edges(
    "approval",
    lambda s: "execute" if s["approved"] else "reject",
)
```

### 1.3 运行带 Human-in-loop 的图

```python
# 编译图，设置中断点
app = graph.compile(interrupt_before=["approval"])

# 第一次运行 — 会在 approval 节点暂停
initial_state = {
    "messages": [],
    "proposed_action": "删除文件 temp.log",
    "approved": None
}

# 执行到 interrupt 前暂停
for event in app.stream(initial_state):
    if "__interrupt__" in event:
        # 把暂停信息发给前端 UI
        print("等待用户决策：", event["__interrupt__"][0].value)
        break

# 用户说"批准"
user_decision = "approve"

# 传入用户决策，继续执行
for event in app.stream(None, interrupt_after=["approval"]):
    print(event)
```

**这就是 Human-in-loop 的精髓

![配图：小黑操作拉杆停止机器，标注“删除文件”，等待人类确认](/assets/17-langgraph-intro-03-human-in-loop.png)**：Agent 等人工决策，收到确认后才继续。

### 1.4 你能想象的应用场景

- **代码审查**：Agent 写完代码，开发者确认后才提交 PR
- **支付确认**：Agent 提出购买建议，用户确认后才下单
- **文件操作**：Agent 列出要删除的文件，用户打勾后执行

**对比你在 multi_agent_collaboration.js 里的人工审批**：
你当时是让 Agent 打印出计划，然后在终端等用户输入 `yes/no`。
LangGraph 的 interrupt 机制做的是同一件事，但更加结构化：
它保存了整个执行上下文，恢复时可以精确回到暂停点。

---

## 2. Checkpoint（状态持久化）

### 2.1 Checkpoint 是什么？

Checkpoint 是 LangGraph 在每一步执行后自动保存的**状态快照**。

用途：
- **故障恢复**：如果程序崩溃，可以从最近的 checkpoint 恢复
- **时间旅行**：回退到之前的某个步骤重新执行
- **审计追踪**：完整记录 Agent 的执行轨迹

### 2.2 使用 Checkpointer

```python
from langgraph.checkpoint.memory import MemorySaver

# 创建内存中的 checkpointer
checkpointer = MemorySaver()

# 编译图时传入
app = graph.compile(checkpointer=checkpointer)

# 运行时需要 thread_id（会话 ID）
config = {"configurable": {"thread_id": "session-001"}}

result = app.invoke(
    {"messages": [("user", "你好")]},
    config=config
)

# 之后可以获取完整历史
state_history = app.get_state(config)
print(state_history.values["messages"])

# 回退到上一步
past_state = app.get_state_history(config)[1]  # 上一步
app.update_state(config, past_state.values)

# 从该点重新执行
result = app.invoke(None, config)
```

### 2.3 Checkpoint 的不同实现

| Checkpointer | 存储位置 | 适合场景 |
|---|---|---|
| `MemorySaver` | 内存 | 开发调试 |
| `SqliteSaver` | SQLite 文件 | 单机持久化 |
| `PostgresSaver` | PostgreSQL | 生产环境，多实例 |

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# SQLite 持久化
checkpointer = SqliteSaver.from_conn_string("checkpoints.db")
```

### 2.4 和你的 memory.json 对比

你在 `memory.js` 里把历史消息存到 `memory.json`，这是手写的 checkpoint。
LangGraph 的 checkpointer 是标准化的实现，还自动保存了**图的执行中间状态**，
不仅仅是消息历史。

![配图：StateGraph示意，四个节点围绕共享状态，蓝色读橙色写](/assets/17-langgraph-intro-01-stategraph.png)

---

## 3. Streaming（流式输出）

### 3.1 为什么需要 Streaming？

LLM 生成文本需要时间。如果等全部生成完再一次性返回，用户体验会差。
流式输出能让用户**看到 LLM 实时生成**的内容。

### 3.2 LangGraph 的三种流模式

```python
# 1. stream — 逐节点输出（看 Agent 每一步在干什么）
for event in app.stream(initial_state, config):
    for node_name, output in event.items():
        print(f"[{node_name}] {output}")

# 2. stream_events — 逐 Token 输出（看 LLM 逐字生成）
from langgraph.graph import StateGraph

for event in app.stream_events(initial_state, config):
    if event["type"] == "token":
        print(event["content"], end="")

# 3. astream_events — 异步流式
async for event in app.astream_events(initial_state, config):
    # 可以放行指定事件类型
    pass
```

### 3.3 实际使用例子

```python
config = {"configurable": {"thread_id": "demo-1"}}

# 实时观察 Agent 的思考链
for event in app.stream(
    {"messages": [("user", "北京和上海哪个更大？")]},
    config
):
    for node, output in event.items():
        if node == "agent":
            # LLM 的输出
            print(f"🤖 {output['messages'][-1].content}")
        elif node == "search":
            # 搜索工具返回
            print(f"🔍 搜索结果: {output['result']}")
```

---

## 4. 子图（Subgraph）

### 4.1 什么是子图？

子图是**嵌套在另一个图里面的图**。用来复用常见流程。

```python
# 定义一个"搜索-总结"子图
search_graph = StateGraph(SearchState)
search_graph.add_node("search", search_tool)
search_graph.add_node("summarize", summarize_fn)
search_graph.add_edge("search", "summarize")
search_graph.add_edge("summarize", END)
search_graph.set_entry_point("search")
search_app = search_graph.compile()

# 在主图中作为一个节点使用
def search_subgraph(state: MainState) -> dict:
    # 调用子图
    result = search_app.invoke({
        "query": state["user_question"]
    })
    return {"search_result": result["summary"]}

main_graph.add_node("search_step", search_subgraph)
```

---

## 5. 综合架构图

把今天学的东西拼在一起，一个生产级 LangGraph Agent 的完整架构：

```
                    ┌──────────────┐
                    │  用户输入     │
                    └──────┬───────┘
                           ▼
              ┌───────────────────────┐
              │    Agent 节点          │ ←── LLM 思考
              │    (call_llm)          │
              └──────┬────────────────┘
                     │
                     ▼
              ┌───────────────────────┐
              │   条件路由              │
              │   (should_continue)    │
              └──┬──────────┬─────────┘
                 │          │
         需要工具 │          │ 可以回答
                 ▼          ▼
     ┌─────────────────┐  ┌───────────────┐
     │ 工具执行节点      │  │ 回答生成       │
     │ (execute_tools)  │  │ (respond)     │
     └──────┬──────────┘  └───────┬───────┘
            │                     │
            │              ┌──────▼───────┐
            │              │ Human-in-    │
            │              │ loop 审批     │
            │              └──────┬───────┘
            │                     │
            └──────── ────────────┘
                                 │
                          ┌──────▼───────┐
                          │   输出        │
                          │   + Checkpoint│
                          └──────────────┘

贯穿全程：
  - Checkpoint：每一步自动保存
  - Streaming：实时输出
```

---

## 6. 下集预告

概念学完了。下一课 [05-practice.md](05-practice.md) 我们会动手写一个
**完整的 Agent 问答系统**，把今天学的全部用上：
- LangGraph 定义状态和节点
- 条件边控制循环
- Human-in-loop 审批
- Checkpoint 持久化
- Streaming 实时输出

也会提供可以在本地运行的最小 Python 文件。

---

*文档更新时间：2026年7月14日*
