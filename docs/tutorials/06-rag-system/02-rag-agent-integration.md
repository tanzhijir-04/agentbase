---
sidebar_position: 2
---

# 02. RAG 与 Agent 的集成

> 上篇说了 RAG 是什么、什么时候用。这篇深入技术细节：嵌入、向量数据库、检索策略、重排优化，以及 RAG 和 Agent 记忆的关系。

---

## 1. 向量嵌入：把文本变成数学

RAG 的第一步是检索。但计算机怎么知道"今天天气怎么样"和"上海的湿度"是相关的？

答案是**向量嵌入（Embedding）**。

嵌入就是把一段文本转换成一串数字向量。关键特性：

- **语义相近的文本，向量距离也近**
- **语义无关的文本，向量距离远**

```
"今天天气怎么样"  → [0.12, -0.34, 0.56, 0.78, ...]  ← 512 维向量
"上海的湿度"      → [0.14, -0.30, 0.52, 0.80, ...]  ← 距离：0.03（很近）
"量子力学原理"    → [-0.87, 0.23, 0.11, -0.45, ...] ← 距离：0.95（很远）
```

### 常用嵌入模型

| 模型 | 维度 | 特点 |
|------|------|------|
| OpenAI `text-embedding-3-small` | 512 / 1536 | 性价比高，默认推荐 |
| OpenAI `text-embedding-3-large` | 256 / 3072 | 更高精度，代价更高 |
| Cohere `embed-multilingual-v3.0` | 1024 | 多语言支持好 |
| 开源 BGE / BAAI | 768 / 1024 | 可本地部署，无 API 费用 |

### 预处理：Chunk 策略

原始文档不能直接丢给嵌入模型。你需要把文档切成小块（Chunk），每个块单独生成向量。

```javascript
// 常见的 Chunk 策略
const chunks = [];

// 策略 1：按固定长度切（简单但粗暴）
function fixedChunk(text, chunkSize = 512, overlap = 50) {
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
}

// 策略 2：按段落切（更自然）
function paragraphChunk(text) {
  return text.split(/\n\n+/)
    .filter(p => p.trim().length > 0);
}

// 策略 3：递归切分（兼顾长度和语义边界）
// 先用段落切，段落太长再按句子切
function recursiveChunk(text, maxSize = 512) {
  // 实际实现通常用 LangChain 的 RecursiveCharacterTextSplitter
}
```

**Chunk 大小的权衡**：

| 大小 | 优点 | 缺点 |
|------|------|------|
| 小（128-256 tokens） | 精确检索，针对性高 | 可能丢失上下文 |
| 中（512 tokens） | 平衡推荐 | 多数场景的首选 |
| 大（1024+ tokens） | 上下文完整 | 精度下降，含噪声多 |

---

## 2. 向量数据库

生成向量之后，你需要存起来，并在查询时做相似度搜索。**向量数据库**就是做这个的。

### 主流选择

| 数据库 | 部署方式 | 适合场景 |
|--------|---------|---------|
| **Chroma** | 本地嵌入 | 开发原型、小型项目 |
| **Pinecone** | SaaS | 生产级，不用自己运维 |
| **Weaviate** | 自托管 / SaaS | 需要完整数据库功能 |
| **Qdrant** | 自托管 / SaaS | 高性能，支持过滤 |
| **pgvector** | PostgreSQL 插件 | 已有 Postgres 的团队 |
| **Milvus** | 自托管 | 大规模（十亿级向量） |

### 相似度搜索

```javascript
/**
 * 向量检索的核心操作
 */
async function similaritySearch(vectorDb, queryEmbedding, topK = 5) {
  // 计算查询向量与所有文档向量的相似度
  const results = vectorDb.search({
    vector: queryEmbedding,
    limit: topK,
    // 相似度度量方式
    metric: "cosine"  // 可选：cosine | dot_product | euclidean
  });

  return results.map(r => ({
    text: r.document,
    score: r.similarity,  // 0~1，越大越相似
    metadata: r.metadata
  }));
}
```

### 三种相似度度量

| 度量 | 公式 | 适用场景 |
|------|------|---------|
| **余弦相似度（Cosine）** | cos(A, B) | 文本相似度（最常用） |
| **点积（Dot Product）** | A·B | 向量已归一化时效果等同余弦 |
| **欧几里得距离（Euclidean）** | \|A - B\|² | 向量本身具有绝对意义时 |

---

## 3. 检索策略

最简单的检索是"直接把问题向量拿去搜相似度"。但这常常不够。这里介绍几种常用策略。

### 3.1 相似度搜索（Naive）

```
用户问题 → 生成向量 → 向量数据库搜索 → 返回 TOP-K
```

优点：简单。
缺点：纯靠语义相似度，可能漏掉关键词精确匹配。

### 3.2 混合搜索（Hybrid Search）

结合**语义搜索**和**关键词搜索**：

```javascript
/**
 * 混合检索：语义 + 关键词
 */
async function hybridSearch(query, vectorDb, bm25Index) {
  // 1. 语义搜索：找"意思相近"
  const queryEmbedding = await embedText(query);
  const semanticResults = await vectorDb.search({
    vector: queryEmbedding,
    limit: 10,
    metric: "cosine"
  });

  // 2. 关键词搜索：找"字面匹配"
  const keywordResults = await bm25Index.search(query, { limit: 10 });

  // 3. 合并结果，加权排序
  const combined = mergeAndRerank(
    semanticResults.map(r => ({ ...r, score: r.similarity * 0.7 })),
    keywordResults.map(r => ({ ...r, score: r.bm25Score * 0.3 }))
  );

  return combined.slice(0, 5);
}
```

**为什么要混合**：纯语义搜索可能在专有名词（"GPT-4o-2025-05-01"）上表现不好，而关键词搜索能精准匹配。

| 搜索类型 | 核心能力 | 典型方法 |
|---------|---------|---------|
| 语义搜索 | 理解意图，找同义表达 | 向量相似度 |
| 关键词搜索 | 精确匹配，专有名词 | BM25 / TF-IDF |
| 混合搜索 | 两者兼顾 | 加权融合 RRF |

### 3.3 Multi-Query 检索

用户的问题往往只有一个，但一个好答案可能需要从多个角度才能找到足够的参考材料。

```javascript
/**
 * Multi-Query：一个问题生成多个子问题，分别检索
 */
async function multiQueryRetrieval(userQuestion, vectorDb) {
  // 让 LLM 生成多个角度的问题
  const subQuestions = await callLLM([
    { role: "system", content: "为下面这个用户问题生成 3 个不同角度的子问题，方便从不同方向检索信息。" },
    { role: "user", content: userQuestion }
  ]);
  // 输出可能是：
  // 1. "GPT-4o 的最大上下文窗口是多少？"
  // 2. "GPT-4o 支持哪些输入模态？"
  // 3. "GPT-4o 的定价模式是什么？"

  // 分别检索每个子问题
  const allResults = await Promise.all(
    subQuestions.map(q => similaritySearch(vectorDb, await embedText(q), 3))
  );

  // 去重合并
  return deduplicate(allResults.flat());
}
```

### 3.4 父文档检索（Parent Document Retrieval）

有时检索到的 Chunk 太小，缺乏上下文。父文档检索的策略是：

1. 把文档切成两种粒度：**大块（父文档）** 和 **小块（子 Chunk）**
2. 只对小块做向量化、存索引
3. 检索时命中小块 → 返回对应的父文档

```javascript
// 父文档检索流程
async function parentDocumentRetrieval(query, vectorDb, docStore) {
  // 1. 用小 Chunk 做精确检索
  const smallChunks = await similaritySearch(vectorDb, query, 3);

  // 2. 找到每个小块所属的父文档
  const parentDocs = smallChunks.map(chunk => ({
    text: docStore.getParent(chunk.parentId),
    chunkText: chunk.text,
    score: chunk.score
  }));

  return parentDocs;
}
```

这样既保证了检索的精度（用小 Chunk），又保证了生成的上下文完整性（用大文档）。

---

## 4. 重排与召回率优化

### 召回率 vs 精确率

RAG 有个经典矛盾：

- **召回率**：相关的文档我找回来了多少？（别漏）
- **精确率**：找回来的文档里有多少是相关的？（别混进垃圾）

```
理想状态：召回率和精确率都高
┌────────────────────────────────┐
│  相关知识库                     │
│  ┌──────────────────────┐      │
│  │  TOP-K 检索结果      │      │
│  │  ✅✅✅✅❌✅✅❌✅  │      │
│  └──────────────────────┘      │
└────────────────────────────────┘
```

第一轮检索通常倾向于**高召回**（多捞一些，宁可错杀），然后通过重排（Re-ranking）来提升**精确率**。

### 重排（Re-ranking）

```javascript
/**
 * 两阶段检索：先召回，再重排
 */
async function twoStageRetrieval(query, vectorDb, topK = 20, finalK = 5) {
  // Stage 1：快速召回，多捞一些
  const candidates = await similaritySearch(vectorDb, query, topK);

  // Stage 2：用更强的模型重排
  const reranked = await reRank(query, candidates);

  return reranked.slice(0, finalK);
}

/**
 * 重排器（Re-ranker）
 * 会比向量相似度更精确地判断"这段文字是不是真的回答了问题"
 */
async function reRank(query, documents) {
  // 方式一：用专门的 Re-ranking 模型（如 Cohere Rerank）
  return await cohereRerank({
    query: query,
    documents: documents.map(d => d.text),
    topN: documents.length
  });

  // 方式二：用 LLM 做重排（更灵活但更慢更贵）
  // 把每个文档标号，让 LLM 打分排序
}
```

常用的重排模型：

| 模型 | 成本 | 效果 |
|------|------|------|
| Cohere Rerank | API 按量计费 | 好，行业标杆 |
| BGE Reranker | 免费，可本地部署 | 较好，性价比高 |
| LLM 打分（GPT-4o） | 贵，慢 | 最好，但成本最高 |

### 一些实用优化技巧

1. **Query 扩展**：检索前先用 LLM 把用户问题扩写成更详细的描述
2. **HyDE**：让 LLM 先"假装回答"这个问题，然后用生成的假答案去检索（假答案往往比原问题更接近真实文档的用语）
3. **MMR（最大边际相关性）**：重排时不仅看相关性，还看多样性，避免返回 5 段差不多的话
4. **元数据过滤**：如果文档有标签（日期、类别、来源），可以在检索时做预过滤

---

## 5. RAG 与 Agent 记忆的区别与协作

这是一个面试高频陷阱，很多人把这两个混为一谈。

### 本质区别

| 维度 | Agent 记忆（Memory） | RAG |
|------|--------------------|-----|
| **存储内容** | 历史对话、Agent 的中间状态、推理过程 | 外部知识库（文档、数据库、API） |
| **用途** | 让 Agent 记住"刚才说了什么" | 让 Agent 获取"外部的事实信息" |
| **数据来源** | Agent 自己产生的 | 外部系统提供的 |
| **更新频率** | 每次交互都更新 | 按需导入、定期同步 |
| **存储方式** | 通常用 KV 或缓存 | 向量数据库 |
| **生命周期** | 对话级（短）或会话级（中） | 持久化（长） |

### 它们是怎么协作的

在一个 Agent 内部，记忆和 RAG 是两条并行的数据通道：

```
用户: "帮我查一下昨天 Q3 财报里提到的营收数据"
                      │
                      ▼
              ┌────────────────┐
              │  Agent 主循环   │
              └────┬───────────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
    ┌─────────┐      ┌───────────┐
    │  记忆    │      │   RAG     │
    │ (Memory) │      │ (知识检索) │
    └────┬────┘      └─────┬─────┘
         │                 │
         ▼                 ▼
    "用户刚才问了     "Q3 财报原文
     财报问题"          第 12 页..."
```

实际流程可能是这样的：

```javascript
async function agentWithRAG(userInput, agentMemory, knowledgeBase) {
  // 1. 从记忆中恢复上下文
  const history = agentMemory.getHistory();

  // 2. 判断是否需要检索外部知识
  const needsRetrieval = await detectNeedForKnowledge(userInput, history);

  let contextDocs = [];
  if (needsRetrieval) {
    // 3. 从 RAG 系统检索相关知识
    contextDocs = await retrieveFromKnowledgeBase(
      knowledgeBase, 
      userInput,
      { history }  // 可以把历史也作为检索上下文
    );
  }

  // 4. 组装最终 prompt：记忆 + RAG 结果 + 用户输入
  const response = await callLLM([
    { role: "system", content: buildPrompt(history, contextDocs) },
    { role: "user", content: userInput }
  ]);

  // 5. 更新记忆
  agentMemory.save(userInput, response);

  return response;
}
```

### 一个具体的协作例子

假设你正在做一个客服 Agent：

```
用户：我刚下单了，但想改地址。
                      │
  ┌───────────────────┴───────────────────┐
  │                                       │
  ▼                                       ▼
记忆（Memory）                     RAG（知识检索）
"用户说刚下单"                  "退款政策文档"
"用户想改地址"                  "订单修改流程"
"用户张三，ID: 12345"           "地址修改表单链接"
                      │
                      ▼
           Agent 生成回复：
           "好的张三，我在系统里找到了您今天
           下的订单 #ORD-2024-8876。改地址
           可以在下单后 30 分钟内操作，请点
           这里修改：[链接]"
```

没有记忆：Agent 记不住用户是谁、刚刚聊了什么。
没有 RAG：Agent 不知道改地址的流程是什么、有没有时间限制、链接在哪里。

---

## 6. 面试高频问法

**Q1：RAG 和 Agent 的记忆有什么区别？分别解决什么问题？**

记忆解决的是"上下文连续性"问题：让 Agent 记住对话历史和内部状态。RAG 解决的是"外部知识获取"问题：让 Agent 获取实时或私有的知识。两者是互补关系，不是替代关系。

**Q2：怎么提升 RAG 的检索准确率？**

从几个方向入手：

1. **输入侧**：优化 Chunk 策略（大小、重叠、边界）；用 Query 扩展或 HyDE 增强问题表达
2. **检索侧**：用混合搜索（语义 + 关键词）；用 Multi-Query 多角度检索；用父文档检索保上下文
3. **输出侧**：两阶段检索（先高召回再重排）；用 MMR 去重提升多样性；检查元数据过滤

没有银弹，一般是组合使用。

**Q3：什么是 Chunk 策略？常见的 Chunk 方式有哪些？**

Chunk 策略就是把文档切成小块的方式。常见方式：

- **固定长度切分**：按 token 数硬切（简单但可能切断句子）
- **语义边界切分**：按段落、句子边界切（自然但长度不均匀）
- **递归切分**：从前到后逐步降级（先段落→再句子→再固定长度）
- **父文档检索**：小 Chunk 检索 + 大 Chunk 作为生成上下文

**Q4：为什么需要重排（Re-ranking）？第一次检索不够吗？**

第一次检索（向量相似度）速度快但精度有限。它的目标是"别漏掉"（高召回），代价是可能混入一些不相关的内容。重排用更精确的模型（但更慢）对候选结果重新排序，作用是"把不相关的内容往后排"（高精度）。两阶段是经典的"先快后准"策略。

**Q5：Embedding 模型的维度越高越好吗？**

不完全是。维度高可以表达更丰富的信息，但会带来几个问题：计算成本更高（相似度计算 O(n)）；存储和检索开销更大；可能出现"维度诅咒"——高维空间中所有向量的距离都趋向于相近，反而区分度下降。实践中 OpenAI 的 `text-embedding-3-small`（512 维）在大多数场景下性价比最高。
