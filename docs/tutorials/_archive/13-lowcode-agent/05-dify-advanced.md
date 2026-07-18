# 05 - Dify 进阶：RAG 管道与自定义工具

> 深入 Dify 的核心能力——让 AI 能查文档、调接口、执行代码

---

## 什么是 RAG？

RAG = Retrieval-Augmented Generation（检索增强生成）

**简单说**：用户提问 → 先查知识库找相关文档 → 把文档发给 AI → AI 基于文档回答

这样做的好处：
- 回答基于你的私有数据，不是 AI 瞎编
- 可以引用原文，用户知道信息来源
- 更新知识库 = 更新 Bot 的知识，不需要重新训练

---

## Dify 的 RAG 管道

### 完整流程

```
用户提问
    ↓
理解问题（对问题进行改写、扩展）
    ↓
检索知识库（找最相关的 N 个段落）
    ↓
重排序（把最相关的结果排前面）
    ↓
组装 Prompt（问题 + 检索到的段落 + 指令）
    ↓
调用 LLM 生成回答
    ↓
后处理（过滤敏感词、格式化）
    ↓
返回给用户
```

### 可调节的参数

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| Top K | 检索几个段落 | 3-5 |
| 相似度阈值 | 低于此值不返回 | 0.6-0.7 |
| 检索模式 | 关键词/向量/混合 | 混合（效果最好） |
| 重排序模型 | 用专门的模型排序 | 启用（提升精度） |

---

## 自定义工具

Dify 的自定义工具相当于 Coze 的插件——让 AI 能调用外部 API。

### 创建 API 工具

1. 进入 **"工具" → "自定义工具" → "创建"**
2. 填写 OpenAPI/Swagger 规范或手动定义

**示例：查天气工具**

```yaml
openapi: 3.0.0
info:
  title: 天气查询
  version: 1.0.0
paths:
  /weather:
    get:
      summary: 查询指定城市的天气
      parameters:
        - name: city
          in: query
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 天气信息
```

### 代码工具（Code Node）

Dify 的工作流支持代码节点，可以写 Python/JavaScript：

```python
def main(data: dict) -> dict:
    # data 包含前面节点的输出
    query = data.get("query", "")
    # 处理数据
    result = {
        "processed": query.upper(),
        "length": len(query)
    }
    return result
```

---

## 工作流高级用法

### 分支与条件

```
[用户输入]
    ↓
[LLM 判断意图]
    ↓
售前 → [查产品知识库] → [LLM 生成推荐]
售后 → [查订单 API] → [LLM 生成处理方案]
其他 → [转人工]
```

### 迭代（循环处理）

适合处理用户上传的多个文件：
1. 用户上传多张图片
2. 循环每张图片
3. 调用图片分析插件
4. 汇总结果

### 参数提取

从用户输入中提取结构化数据：

```
用户输入："帮我查张三的订单，单号是 ORD-2024-001"
提取结果：
{
  "customer_name": "张三",
  "order_id": "ORD-2024-001",
  "action": "query_order"
}
```

---

## 日志与监控

### 日志功能

Dify 记录每一次对话的完整日志：
- 用户输入
- AI 回复
- 调用了哪些工具
- 每次 LLM 调用的 Token 消耗
- 耗时

### 数据分析

在日志页面可以看到：
- 总对话数
- 活跃用户数
- 平均回复时间
- Token 消耗趋势
- 常见问题统计

---

## 性能优化

| 问题 | 优化方案 |
|------|----------|
| 回复太慢 | 换更快的模型（GPT-3.5→GPT-4o-mini） |
| 知识库查不到 | 减小分段大小，提高 Top K |
| 回答不准确 | 优化 Prompt，增加示例 |
| Token 消耗高 | 减少上下文长度，压缩历史 |

---

下一步：**[06 Coze vs Dify 对比与选型](./06-coze-vs-dify.md)**
