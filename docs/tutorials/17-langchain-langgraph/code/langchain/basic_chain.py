"""
basic_chain.py — 最简单的 LangChain Chain
==========================
展示：ChatModel + PromptTemplate + StrOutputParser + LCEL
运行：python minimal_agent/langchain/basic_chain.py
"""
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


def main():
    # 1. 创建 LLM（换成你有的模型）
    # 如果用 Anthropic：from langchain_anthropic import ChatAnthropic
    # 如果用 Ollama：   from langchain_ollama import ChatOllama
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    # 2. 创建提示模板
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个专业的{source_lang}到{target_lang}的翻译。"
                   "只返回翻译结果，不要解释。"),
        ("user", "{text}")
    ])

    # 3. 输出解析器
    parser = StrOutputParser()

    # 4. 组装 Chain（LCEL：用 | 连接）
    chain = prompt | llm | parser

    # 5. 单次调用
    print("=== 单次翻译 ===")
    result = chain.invoke({
        "source_lang": "中文",
        "target_lang": "英语",
        "text": "人工智能正在改变世界"
    })
    print(f"结果：{result}\n")

    # 6. 批量翻译
    print("=== 批量翻译 ===")
    texts = [
        {"source_lang": "中文", "target_lang": "英语", "text": "深度学习"},
        {"source_lang": "中文", "target_lang": "英语", "text": "自然语言处理"},
        {"source_lang": "中文", "target_lang": "英语", "text": "强化学习"},
    ]
    batch_results = chain.batch(texts)
    for t, r in zip(texts, batch_results):
        print(f"  {t['text']} -> {r}")

    # 7. 流式输出
    print("\n=== 流式输出（打字效果） ===")
    for chunk in chain.stream({
        "source_lang": "中文",
        "target_lang": "英语",
        "text": "人工智能正在改变世界的每一个角落"
    }):
        print(chunk, end="", flush=True)
    print()


if __name__ == "__main__":
    main()
