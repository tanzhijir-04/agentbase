"""
langgraph_agent.py — LangGraph Agent + Human-in-loop
===============================
展示：StateGraph、条件边、interrupt、Checkpoint、Streaming
运行：python minimal_agent/langchain/langgraph_agent.py
"""
from typing import TypedDict, Annotated, List, Literal
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool


# ═══════════════════════════════════
# 1. 定义工具
# ═══════════════════════════════════

@tool
def calculate(expression: str) -> str:
    """计算数学表达式。输入应为数学公式，如 '2 + 3 * 4'"""
    allowed = set("0123456789+-*/.() ")
    if not all(c in allowed for c in expression):
        return "错误：只支持数字和基本运算符"
    try:
        return f"{expression} = {eval(expression)}"
    except Exception as e:
        return f"计算错误：{e}"


@tool
def get_weather(city: str) -> str:
    """查询某个城市的当前天气"""
    data = {
        "北京": "晴天 25°C",
        "上海": "多云 28°C",
        "广州": "雷阵雨 30°C",
        "深圳": "晴 29°C",
    }
    return data.get(city, f"{city}：暂无数据")


tools = [calculate, get_weather]
tools_by_name = {t.name: t for t in tools}

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)


# ═══════════════════════════════════
# 2. 定义状态
# ═══════════════════════════════════

class AgentState(TypedDict):
    messages: Annotated[List, add_messages]
    needs_approval: bool
    approved: bool


# ═══════════════════════════════════
# 3. 定义节点
# ═══════════════════════════════════

def call_llm(state: AgentState) -> dict:
    """Agent 节点：调用 LLM"""
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}


def execute_tools(state: AgentState) -> dict:
    """工具执行节点：执行 LLM 请求的工具调用"""
    last_msg = state["messages"][-1]
    tool_messages = []

    for tool_call in last_msg.tool_calls:
        tool_fn = tools_by_name[tool_call["name"]]
        result = tool_fn.invoke(tool_call["args"])
        tool_messages.append(ToolMessage(
            content=str(result),
            tool_call_id=tool_call["id"]
        ))

    return {"messages": tool_messages}


def human_approval(state: AgentState) -> dict:
    """人工审批节点：暂停等待用户确认"""
    last_action = state["messages"][-1]

    action_info = []
    if hasattr(last_action, "tool_calls") and last_action.tool_calls:
        for tc in last_action.tool_calls:
            action_info.append({
                "tool": tc["name"],
                "args": tc["args"]
            })

    # interrupt 会暂停图的执行，将数据返回给调用方
    decision = interrupt({
        "action": action_info,
        "prompt": "是否批准这些工具调用？"
    })

    approved = decision == "approve"
    return {"approved": approved}


# ═══════════════════════════════════
# 4. 条件路由函数
# ═══════════════════════════════════

def should_continue(state: AgentState) -> Literal["tools", "approval", "end"]:
    """Agent 节点后的路由决策"""
    last_msg = state["messages"][-1]

    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        # LLM 想调用工具
        if state.get("needs_approval", False):
            return "approval"   # 需要人工审批
        return "tools"          # 直接执行工具

    return "end"  # LLM 直接回答，结束


def check_approval(state: AgentState) -> Literal["tools", "end"]:
    """审批后的路由决策"""
    if state.get("approved", False):
        return "tools"  # 批准，执行工具

    # 不批准，取消操作
    return "end"


# ═══════════════════════════════════
# 5. 构建图
# ═══════════════════════════════════

graph = StateGraph(AgentState)

graph.add_node("agent", call_llm)
graph.add_node("tools", execute_tools)
graph.add_node("approval", human_approval)

graph.set_entry_point("agent")

# Agent -> 条件路由
graph.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        "approval": "approval",
        "end": END
    }
)

# 审批 -> 条件路由
graph.add_conditional_edges(
    "approval",
    check_approval,
    {
        "tools": "tools",
        "end": END
    }
)

# 工具执行完成后回到 Agent 继续思考
graph.add_edge("tools", "agent")


# ═══════════════════════════════════
# 6. 编译
# ═══════════════════════════════════

app = graph.compile(
    checkpointer=MemorySaver(),
    interrupt_before=["approval"]  # 在 approval 节点前暂停
)


# ═══════════════════════════════════
# 7. 运行（简单模式，不触发 human-in-loop）
# ═══════════════════════════════════

def run_simple():
    """简单模式：不需要人工审批"""
    print("=== 简单模式（直接执行工具） ===")
    config = {"configurable": {"thread_id": "simple-demo"}}

    for event in app.stream(
        {
            "messages": [HumanMessage(content="北京的天气如何？再算 25 * 4")],
            "needs_approval": False,
            "approved": False
        },
        config
    ):
        for node, out in event.items():
            if isinstance(out, dict) and out.get("messages"):
                msg = out["messages"][-1]
                if hasattr(msg, "content") and msg.content:
                    print(f"[{node}] {msg.content}")


# ═══════════════════════════════════
# 8. 打印图结构
# ═══════════════════════════════════

def print_graph():
    """打印图的 Mermaid 表示"""
    print("=== 图结构 ===")
    print(app.get_graph().draw_mermaid())
    print()


if __name__ == "__main__":
    print_graph()
    run_simple()
