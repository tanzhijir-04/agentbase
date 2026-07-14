"""
rag_agent.py — 带 RAG 和 Memory 的 Agent
==========================
展示：Tool 定义、Agent Executor、对话记忆
运行：python minimal_agent/langchain/rag_agent.py
"""
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.memory import ConversationBufferMemory


# ── 1. 定义工具 ──

@tool
def calculate(expression: str) -> str:
    """计算数学表达式。输入应为数学公式，如 '2 + 3 * 4'"""
    try:
        # 安全检查：只允许数字和基本运算符
        allowed = set("0123456789+-*/.() ")
        if not all(c in allowed for c in expression):
            return "错误：只支持数字和基本运算符（+ - * /）"
        result = eval(expression)
        return f"计算结果：{result}"
    except Exception as e:
        return f"计算错误：{e}"


@tool
def get_weather(city: str) -> str:
    """查询某个城市的当前天气"""
    weather_data = {
        "北京": "晴天，25°C，轻度污染",
        "上海": "多云转阴，28°C，湿度 75%",
        "广州": "雷阵雨，30°C，注意带伞",
        "深圳": "晴，29°C，适合出门",
        "成都": "阴天，22°C，小雨概率 60%",
    }
    return weather_data.get(city, f"{city}：暂无天气数据")


tools = [calculate, get_weather]


def main():
    # ── 2. 创建 LLM ──
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    # ── 3. 创建 Prompt（带 chat_history 占位符） ──
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个智能助手。你可以使用工具来回答问题。"
                   "在回答中，请引用你使用的工具结果。"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    # ── 4. 创建 Agent ──
    agent = create_tool_calling_agent(llm, tools, prompt)

    # ── 5. 创建 Memory ──
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )

    # ── 6. 创建 Agent Executor ──
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        memory=memory,
        verbose=True,
        max_iterations=5,
    )

    # ── 7. 运行对话 ──
    print("=== 第一轮对话 ===")
    resp1 = agent_executor.invoke({"input": "你好！我叫小明"})
    print(f"Agent：{resp1['output']}")

    print("\n=== 第二轮对话（测试记忆） ===")
    resp2 = agent_executor.invoke({"input": "我叫什么名字？"})
    print(f"Agent：{resp2['output']}")

    print("\n=== 第三轮对话（测试工具调用） ===")
    resp3 = agent_executor.invoke({"input": "计算 (25 + 17) * 3 的结果"})
    print(f"Agent：{resp3['output']}")

    print("\n=== 第四轮对话（测试多工具） ===")
    resp4 = agent_executor.invoke({
        "input": "北京天气怎么样？再帮我算 100 / 8"
    })
    print(f"Agent：{resp4['output']}")


if __name__ == "__main__":
    main()
