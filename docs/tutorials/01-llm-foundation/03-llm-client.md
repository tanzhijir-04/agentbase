# LLM 调用封装：请求、重试与超时

> 写 Agent 跟写 Demo 最大的区别就是：你不能再假设网络永远通、API 永远返回正常数据。

---

## 为什么需要封装

裸调 LLM API 的痛，写过两天 Agent 的都懂：

```javascript
// ❌ 裸调 = 裸奔
const res = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'gpt-4', messages: [...] })
});
const data = await res.json();
```

这段代码跑在 Demo 里没问题。跑在生产 Agent 里：

- 网络抖一下——挂掉
- API rate limit——挂掉
- 模型返回超时——挂掉
- 返回格式不对——挂掉
- 网络不通——挂掉

做 Agent 的 LLM 调用封装，核心解决三个问题：

1. **重试机制**：失败后自动重试，不是全盘崩溃
2. **超时控制**：不让模型的一次"卡住"拖死整个 Agent
3. **错误分类**：哪些要重试，哪些直接报错，别搞混

![配图：左边小黑在暴风雨中裸奔被闪电击中，右边小黑在屋子里安全操控机器——裸调 vs 封装的对比](/assets/03-llm-client-01-raw-vs-wrapped.png)

---

## 基本请求封装

### 基础版：统一入口

```javascript
class LLMClient {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4o';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature ?? 0;
  }

  async chat(messages, options = {}) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages,
        temperature: options.temperature ?? this.temperature,
        max_tokens: options.maxTokens || this.maxTokens,
        ...(options.tools && { tools: options.tools }),
        ...(options.responseFormat && { response_format: options.responseFormat }),
      }),
    });

    if (!response.ok) {
      throw new LLMError(response.status, await response.text());
    }

    const data = await response.json();
    return data.choices[0];
  }
}

class LLMError extends Error {
  constructor(status, body) {
    super(`LLM API Error [${status}]: ${body}`);
    this.status = status;
    this.body = body;
  }
}
```

---

## 重试策略：指数退避

### 哪些错误应该重试

不是所有错误都该重试。这叫**错误分类**：

| HTTP 状态码 | 含义 | 是否重试 | 原因 |
|------------|------|---------|------|
| 429 | Rate Limit | ✅ 是 | 等等再试就行 |
| 500 | 服务器错误 | ✅ 是 | 可能是临时故障 |
| 502/503 | 服务不可用 | ✅ 是 | 上游挂了 |
| 400 | 请求格式错误 | ❌ 否 | 重试一万次也报错 |
| 401 | 认证失败 | ❌ 否 | Key 有问题 |
| 404 | 模型不存在 | ❌ 否 | 检查模型名 |
| 413 | 请求太大 | ❌ 否 | 减少输入上下文 |

### 指数退避算法

重试不是"每秒重试一次"，而是**越来越慢**地重试：

```javascript
async function withRetry(fn, options = {}) {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelay = options.baseDelay ?? 1000;  // 1秒
  const maxDelay = options.maxDelay ?? 30000;    // 最多30秒

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 不可重试的错误直接抛出
      if (isNonRetryable(error)) {
        throw error;
      }

      // 最后一次尝试也失败了
      if (attempt === maxRetries) {
        throw error;
      }

      // 计算等待时间：指数退避 + 随机抖动
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt),
        maxDelay
      );
      // jitter：随机 ± 25%，避免多个请求同时重试
      const jitter = delay * (0.75 + Math.random() * 0.5);

      console.warn(`[LLM] 尝试 ${attempt + 1}/${maxRetries} 失败，${Math.round(jitter)}ms 后重试`);

      await sleep(jitter);
    }
  }
}

function isNonRetryable(error) {
  if (error instanceof LLMError) {
    return [400, 401, 403, 404, 413].includes(error.status);
  }
  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 为什么要加 Jitter（抖动）

不加抖动的重试有一个经典问题——**惊群效应**：

> 假设你的 Agent 有 100 个并发请求同时遇到了 rate limit。1 秒后它们同时重试，又把 API 打满了。这叫"重试风暴"。
>
> 加上 jitter（随机偏移 25%），重试请求散落在时间轴上，不会形成新的尖峰。

![配图：小黑看一个怪钟表，每次指针等待的时间越来越长——1秒、2秒、4秒、8秒——指数退避](/assets/03-llm-client-02-retry-backoff.png)

---

## 超时处理

### 为什么需要超时

LLM API 不是永远会在合理时间内返回的。网络问题、服务端卡住、模型过度思考——都可能让一个请求拖到天荒地老。

Agent 场景里，一个超时的 LLM 调用会**阻塞整个 Agent 循环**。必须设置超时。

### AbortController 实现

```javascript
function withTimeout(promise, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      controller.signal.addEventListener('abort', () => {
        reject(new Error(`LLM 请求超时 (${timeoutMs}ms)`));
      });
    }),
  ]).finally(() => clearTimeout(timeoutId));
}
```

### 集成到 LLM Client

```javascript
class LLMClient {
  async chat(messages, options = {}) {
    const timeout = options.timeout ?? 30000;  // 默认 30 秒

    return withRetry(async () => {
      return withTimeout(this._doChat(messages, options), timeout);
    }, options.retry || {});
  }

  async _doChat(messages, options) {
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), options.timeout || 30000);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: { /* ... */ },
        body: JSON.stringify({ /* ... */ }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new LLMError(response.status, await response.text());
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutTimer);
    }
  }
}
```

---

## 完整封装示例

把前面所有内容整合成一个可用的 LLMClient：

```javascript
class LLMClient {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4o';
    this.defaultOptions = {
      temperature: config.temperature ?? 0,
      maxTokens: config.maxTokens ?? 4096,
      timeout: config.timeout ?? 30000,
      maxRetries: config.maxRetries ?? 3,
    };
  }

  async chat(messages, options = {}) {
    const opts = { ...this.defaultOptions, ...options };

    return withRetry(async () => {
      return withTimeout(this._request(messages, opts), opts.timeout);
    }, {
      maxRetries: opts.maxRetries,
      baseDelay: 1000,
    });
  }

  async _request(messages, opts) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeout);

    try {
      const body = {
        model: opts.model || this.model,
        messages,
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
      };
      if (opts.tools) body.tools = opts.tools;
      if (opts.responseFormat) body.response_format = opts.responseFormat;
      if (opts.stop) body.stop = opts.stop;

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new LLMError(response.status, await response.text());
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }
}

// 使用
const client = new LLMClient({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
  timeout: 30000,
  maxRetries: 3,
});

const result = await client.chat([
  { role: 'user', content: '你好' }
], {
  temperature: 0.3,
  maxTokens: 500,
});
```

---

## 高级话题

### 流式调用的重试

流式请求（stream: true）不太适合简单的重试——因为可能已经输出了一半内容。流式出错了通常只能中断连接，让上层逻辑决定怎么处理。

```javascript
async chatStream(messages, onToken, options = {}) {
  const response = await fetch(`${this.baseURL}/chat/completions`, {
    method: 'POST',
    headers: { /* ... */ },
    body: JSON.stringify({ ...messages, stream: true }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') return;

      const parsed = JSON.parse(data);
      const delta = parsed.choices[0]?.delta?.content;
      if (delta) onToken(delta);
    }
  }
}
```

### 请求熔断

如果连续多次调用都失败，直接停药一段时间——这叫熔断（Circuit Breaker）：

```javascript
class CircuitBreaker {
  constructor(threshold = 5, resetTimeout = 60000) {
    this.failures = 0;
    this.threshold = threshold;
    this.resetTimeout = resetTimeout;
    this.state = 'CLOSED'; // CLOSED | OPEN | HALF_OPEN
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }

    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
        setTimeout(() => { this.state = 'HALF_OPEN'; }, this.resetTimeout);
      }
      throw error;
    }
  }
}
```

![配图：小黑站在一个大闸门前，闸门有三种状态标记——关闭、打开、半开——断路器的三种状态](/assets/03-llm-client-03-circuit-breaker.png)

---

### 面试高频问法

**Q1: LLM 调用为什么要做重试？哪些错误该重试，哪些不该？**

参考答案要点：网络抖动、API 限流（429）、服务端临时故障（5xx）是正常的，应该重试。4xx 错误（400 格式错误、401 认证失败、404 模型不存在）是业务错误，重试一万次也没用。Agent 场景下重试必须有上限和指数退避+抖动，防止重试风暴。

**Q2: 指数退避算法怎么实现？为什么需要加 jitter？**

参考答案要点：每次重试等待时间 = baseDelay × 2^attempt（ capped 到 maxDelay）。Jitter 是在计算值上随机 ±25%，作用是让大量并发重试的请求不在同一时刻发出，避免重试风暴（惊群效应）。

**Q3: Agent 的 LLM 调用超时怎么设计？**

参考答案要点：用 AbortController/fetch 的 signal 实现超时，默认 30 秒。超时后走重试逻辑。超时值和重试次数需要跟 Agent 的整体延迟预算匹配——Agent 一次决策循环的总耗时不能超过用户体验可接受的范围。流式请求的超时策略不同，推荐用首 token 超时（TTFT）和整体超时两层控制。

---

*配套代码：本项目中的 `llm_client.js` 实现了完整的请求封装*
*更新时间：2026年7月18日*
