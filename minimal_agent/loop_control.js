#!/usr/bin/env node

/**
 * Loop/Workflow Control System
 *
 * 功能：
 * 1. 循环控制：最大迭代限制、超时控制、步数跟踪、自动中断
 * 2. 重试策略：指数退避、最大重试次数、条件重试
 * 3. 断路器模式：故障计数、半开探测、自动恢复
 * 4. 速率限制：令牌桶算法、请求节流、队列管理
 * 5. 状态机：状态转换、条件守卫、事件处理
 */

// ==================== 循环控制器 ====================

class LoopController {
  /**
   * 创建一个循环控制器
   * @param {Object} options - 配置选项
   * @param {number} options.maxIterations - 最大迭代次数（默认 100）
   * @param {number} options.timeout - 超时时间（毫秒，默认 30000）
   * @param {Function} options.breakCondition - 提前中断条件函数
   * @param {Function} options.onProgress - 进度回调
   */
  constructor(options = {}) {
    this.maxIterations = options.maxIterations || 100;
    this.timeout = options.timeout || 30000;
    this.breakCondition = options.breakCondition || null;
    this.onProgress = options.onProgress || null;

    this.iterationCount = 0;
    this.startTime = null;
    this.isRunning = false;
    this.isPaused = false;
    this.history = [];
  }

  /**
   * 执行循环迭代
   * @param {Function} iterationFn - 每次迭代执行的函数
   * @returns {Promise<Object>} 执行结果
   */
  async run(iterationFn) {
    if (typeof iterationFn !== 'function') {
      throw new Error('iterationFn must be a function');
    }

    this.isRunning = true;
    this.startTime = Date.now();
    this.iterationCount = 0;
    this.history = [];

    const results = [];

    try {
      while (this.iterationCount < this.maxIterations) {
        // 检查暂停状态
        if (this.isPaused) {
          await this.waitForResume();
        }

        // 检查超时
        if (this.hasTimedOut()) {
          return {
            success: false,
            reason: 'timeout',
            message: 'Exceeded timeout of ' + this.timeout + 'ms',
            iterations: this.iterationCount,
            results
          };
        }

        this.iterationCount++;
        const iterationStart = Date.now();

        try {
          const result = await iterationFn(this.iterationCount, results);

          this.history.push({
            iteration: this.iterationCount,
            duration: Date.now() - iterationStart,
            result
          });

          results.push(result);

          // 进度回调
          if (this.onProgress) {
            this.onProgress({
              iteration: this.iterationCount,
              maxIterations: this.maxIterations,
              elapsed: Date.now() - this.startTime,
              result
            });
          }

          // 检查中断条件
          if (this.breakCondition && this.breakCondition(result, this.iterationCount, results)) {
            return {
              success: true,
              reason: 'break_condition',
              message: 'Break condition met',
              iterations: this.iterationCount,
              results
            };
          }

        } catch (error) {
          this.history.push({
            iteration: this.iterationCount,
            duration: Date.now() - iterationStart,
            error: error.message
          });

          throw error;
        }
      }

      return {
        success: true,
        reason: 'completed',
        message: 'Completed ' + this.maxIterations + ' iterations',
        iterations: this.iterationCount,
        results
      };

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 暂停循环
   */
  pause() {
    if (this.isRunning) {
      this.isPaused = true;
    }
  }

  /**
   * 恢复循环
   */
  resume() {
    this.isPaused = false;
    if (this._resolvePause) {
      this._resolvePause();
      this._resolvePause = null;
    }
  }

  /**
   * 等待恢复
   */
  waitForResume() {
    const self = this;
    return new Promise(function(resolve) {
      self._resolvePause = resolve;
    });
  }

  /**
   * 检查是否超时
   */
  hasTimedOut() {
    if (!this.startTime || this.timeout <= 0) return false;
    return Date.now() - this.startTime >= this.timeout;
  }

  /**
   * 获取剩余时间
   */
  getRemainingTime() {
    if (!this.startTime) return this.timeout;
    return Math.max(0, this.timeout - (Date.now() - this.startTime));
  }

  /**
   * 获取循环状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      iterationCount: this.iterationCount,
      maxIterations: this.maxIterations,
      elapsed: this.startTime ? Date.now() - this.startTime : 0,
      remainingTime: this.getRemainingTime(),
      historySize: this.history.length
    };
  }

  /**
   * 重置控制器
   */
  reset() {
    this.iterationCount = 0;
    this.startTime = null;
    this.isRunning = false;
    this.isPaused = false;
    this.history = [];
  }
}


// ==================== 重试策略 ====================

class RetryStrategy {
  /**
   * 创建一个重试策略
   * @param {Object} options
   * @param {number} options.maxRetries - 最大重试次数（默认 3）
   * @param {number} options.baseDelay - 基础延迟（毫秒，默认 1000）
   * @param {number} options.maxDelay - 最大延迟（毫秒，默认 30000）
   * @param {string} options.backoffType - 退避类型：fixed | linear | exponential（默认 exponential）
   * @param {Function} options.retryCondition - 判断是否应重试的函数 (error, attempt) => boolean
   * @param {Function} options.onRetry - 重试回调
   */
  constructor(options = {}) {
    this.maxRetries = (options.maxRetries !== undefined && options.maxRetries !== null) ? options.maxRetries : 3;
    this.baseDelay = (options.baseDelay !== undefined && options.baseDelay !== null) ? options.baseDelay : 1000;
    this.maxDelay = (options.maxDelay !== undefined && options.maxDelay !== null) ? options.maxDelay : 30000;
    this.backoffType = options.backoffType || 'exponential';
    this.retryCondition = options.retryCondition || (function() { return true; });
    this.onRetry = options.onRetry || null;
  }

  /**
   * 执行带重试的函数
   * @param {Function} fn - 要执行的异步函数
   * @returns {Promise<Object>} 执行结果
   */
  async execute(fn) {
    var lastError = null;

    for (var attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        var result = await fn(attempt + 1);

        if (attempt > 0 && this.onRetry) {
          this.onRetry({
            attempt: attempt + 1,
            totalRetries: this.maxRetries,
            status: 'recovered',
            lastError: lastError
          });
        }

        return {
          success: true,
          attempts: attempt + 1,
          result: result
        };

      } catch (error) {
        lastError = error;

        // 检查是否应该重试
        if (attempt >= this.maxRetries || !this.retryCondition(error, attempt + 1)) {
          return {
            success: false,
            attempts: attempt + 1,
            error: error.message,
            lastError: lastError
          };
        }

        // 计算延迟
        var delay = this.calculateDelay(attempt + 1);

        if (this.onRetry) {
          this.onRetry({
            attempt: attempt + 1,
            totalRetries: this.maxRetries,
            status: 'retrying',
            delay: delay,
            error: error.message
          });
        }

        // 等待后重试
        await this.sleep(delay);
      }
    }
  }

  /**
   * 计算重试延迟
   */
  calculateDelay(attempt) {
    var delay;

    switch (this.backoffType) {
      case 'fixed':
        delay = this.baseDelay;
        break;

      case 'linear':
        delay = this.baseDelay * attempt;
        break;

      case 'exponential':
      default:
        delay = this.baseDelay * Math.pow(2, attempt - 1);
        // 添加随机抖动（jitter），防止重试风暴
        delay = delay + Math.random() * delay * 0.1;
        break;
    }

    return Math.min(delay, this.maxDelay);
  }

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
  }
}


// ==================== 断路器 ====================

class CircuitBreaker {
  /**
   * 创建一个断路器
   * @param {Object} options
   * @param {number} options.failureThreshold - 失败阈值（默认 5）
   * @param {number} options.successThreshold - 半开状态下成功恢复阈值（默认 2）
   * @param {number} options.openTimeout - 开路超时（毫秒，默认 30000）
   * @param {number} options.halfOpenTimeout - 半开超时（毫秒，默认 10000）
   * @param {Function} options.onStateChange - 状态变化回调
   */
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.openTimeout = options.openTimeout || 30000;
    this.halfOpenTimeout = options.halfOpenTimeout || 10000;
    this.onStateChange = options.onStateChange || null;

    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastStateChangeTime = Date.now();

    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      stateHistory: [{ state: 'closed', timestamp: Date.now() }]
    };
  }

  /**
   * 执行受保护的操作
   * @param {Function} fn - 要执行的函数
   * @returns {Promise<any>} 执行结果
   */
  async call(fn) {
    this.metrics.totalCalls++;

    if (!this.canProceed()) {
      this.metrics.rejectedCalls++;
      throw new Error('Circuit breaker is OPEN. Rejected call. State: ' + this.state);
    }

    try {
      var result = await fn();
      this.onSuccess();
      this.metrics.successfulCalls++;
      return result;

    } catch (error) {
      this.onFailure();
      this.metrics.failedCalls++;
      throw error;
    }
  }

  /**
   * 是否可以继续执行
   */
  canProceed() {
    if (this.state === 'closed') return true;

    if (this.state === 'open') {
      // 检查是否达到半开探测时间
      if (Date.now() - this.lastStateChangeTime >= this.openTimeout) {
        this.transitionTo('half-open');
        return true;
      }
      return false;
    }

    // half-open: 允许探测请求
    if (this.state === 'half-open') {
      if (Date.now() - this.lastStateChangeTime >= this.halfOpenTimeout) {
        this.transitionTo('closed');
        return true;
      }
      return true;
    }

    return false;
  }

  /**
   * 成功回调
   */
  onSuccess() {
    if (this.state === 'half-open') {
      this.successCount++;

      if (this.successCount >= this.successThreshold) {
        this.transitionTo('closed');
      }
    } else {
      this.failureCount = 0;
    }
  }

  /**
   * 失败回调
   */
  onFailure() {
    this.lastFailureTime = Date.now();
    this.failureCount++;

    if (this.state === 'closed' && this.failureCount >= this.failureThreshold) {
      this.transitionTo('open');
    } else if (this.state === 'half-open') {
      this.transitionTo('open');
    }
  }

  /**
   * 状态转换
   */
  transitionTo(newState) {
    var oldState = this.state;
    this.state = newState;
    this.lastStateChangeTime = Date.now();

    if (newState === 'open') {
      this.successCount = 0;
    } else if (newState === 'half-open') {
      this.successCount = 0;
      this.failureCount = 0;
    } else if (newState === 'closed') {
      this.failureCount = 0;
      this.successCount = 0;
    }

    this.metrics.stateHistory.push({ state: newState, timestamp: Date.now() });

    if (this.onStateChange) {
      this.onStateChange({ from: oldState, to: newState, timestamp: Date.now() });
    }
  }

  /**
   * 手动重置断路器（强制回到 closed）
   */
  reset() {
    this.transitionTo('closed');
  }

  /**
   * 强制打开断路器
   */
  forceOpen() {
    this.transitionTo('open');
  }

  /**
   * 获取断路器状态
   */
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      failureThreshold: this.failureThreshold,
      successCount: this.successCount,
      successThreshold: this.successThreshold,
      metrics: {
        totalCalls: this.metrics.totalCalls,
        successfulCalls: this.metrics.successfulCalls,
        failedCalls: this.metrics.failedCalls,
        rejectedCalls: this.metrics.rejectedCalls,
        stateHistory: this.metrics.stateHistory
      }
    };
  }
}


// ==================== 速率限制器（令牌桶） ====================

class RateLimiter {
  /**
   * 创建一个速率限制器（令牌桶算法）
   * @param {Object} options
   * @param {number} options.tokensPerSecond - 每秒生成的令牌数（默认 10）
   * @param {number} options.bucketSize - 令牌桶容量（默认 100）
   * @param {number} options.maxQueueSize - 最大队列长度（默认 500）
   */
  constructor(options = {}) {
    this.tokensPerSecond = options.tokensPerSecond || 10;
    this.bucketSize = options.bucketSize || 100;
    this.maxQueueSize = options.maxQueueSize || 500;

    this.tokens = this.bucketSize;
    this.lastRefillTime = Date.now();
    this.queue = [];
    this.isProcessing = false;

    this.metrics = {
      totalProcessed: 0,
      totalRejected: 0,
      totalTimedOut: 0,
      peakQueueSize: 0
    };
  }

  /**
   * 尝试执行一个受限操作
   * @param {Function} fn - 要执行的函数
   * @param {Object} options
   * @param {number} options.tokens - 消耗的令牌数（默认 1）
   * @param {number} options.timeout - 等待令牌的超时时间（毫秒，0=不等待直接拒绝）
   * @param {string} options.priority - 优先级 high | normal | low
   * @returns {Promise<any>} 执行结果
   */
  async schedule(fn, options) {
    if (!options) options = {};
    var tokens = options.tokens || 1;
    var timeout = options.timeout || 0;
    var priority = options.priority || 'normal';

    this.refill();

    // 如果有足够令牌，直接执行
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      this.metrics.totalProcessed++;
      try {
        return await fn();
      } finally {
        this.processQueue();
      }
    }

    // 如果 timeout=0 且令牌不足，拒绝执行
    if (timeout === 0) {
      this.metrics.totalRejected++;
      throw new Error('Rate limited: insufficient tokens. Available: ' + Math.floor(this.tokens) + ', Required: ' + tokens);
    }

    // 队列已满时拒绝
    if (this.queue.length >= this.maxQueueSize) {
      this.metrics.totalRejected++;
      throw new Error('Rate limited: queue full (' + this.maxQueueSize + ')');
    }

    // 加入等待队列
    var self = this;
    return new Promise(function(resolve, reject) {
      var entry = {
        fn: fn,
        tokens: tokens,
        priority: self.priorityValue(priority),
        queuedAt: Date.now(),
        resolve: resolve,
        reject: reject,
        timeout: timeout
      };

      self.queue.push(entry);
      self.metrics.peakQueueSize = Math.max(self.metrics.peakQueueSize, self.queue.length);

      // 设置超时
      if (timeout > 0) {
        entry.timer = setTimeout(function() {
          self.removeFromQueue(entry);
          self.metrics.totalTimedOut++;
          reject(new Error('Rate limiter timeout after ' + timeout + 'ms'));
        }, timeout);
      }

      self.processQueue();
    });
  }

  /**
   * 补充令牌
   */
  refill() {
    var now = Date.now();
    var elapsed = (now - this.lastRefillTime) / 1000;
    var newTokens = elapsed * this.tokensPerSecond;

    if (newTokens > 0) {
      this.tokens = Math.min(this.bucketSize, this.tokens + newTokens);
      this.lastRefillTime = now;
    }
  }

  /**
   * 处理等待队列
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    // 按优先级和排队时间排序
    this.queue.sort(function(a, b) {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.queuedAt - b.queuedAt;
    });

    while (this.queue.length > 0) {
      this.refill();

      var entry = this.queue[0];

      if (this.tokens < entry.tokens) {
        break;
      }

      this.queue.shift();
      this.tokens -= entry.tokens;
      this.metrics.totalProcessed++;

      if (entry.timer) clearTimeout(entry.timer);

      try {
        var result = await entry.fn();
        entry.resolve(result);
      } catch (error) {
        entry.reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * 从队列中移除条目
   */
  removeFromQueue(entry) {
    var index = this.queue.indexOf(entry);
    if (index >= 0) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * 优先级数值映射
   */
  priorityValue(priority) {
    switch (priority) {
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  /**
   * 获取速率限制器状态
   */
  getStatus() {
    return {
      tokens: Math.floor(this.tokens),
      bucketSize: this.bucketSize,
      tokensPerSecond: this.tokensPerSecond,
      queueSize: this.queue.length,
      maxQueueSize: this.maxQueueSize,
      metrics: {
        totalProcessed: this.metrics.totalProcessed,
        totalRejected: this.metrics.totalRejected,
        totalTimedOut: this.metrics.totalTimedOut,
        peakQueueSize: this.metrics.peakQueueSize
      }
    };
  }
}


// ==================== 状态机 ====================

class StateMachine {
  /**
   * 创建一个状态机
   * @param {Object} options
   * @param {string} options.initialState - 初始状态
   * @param {Object} options.states - 状态定义
   * @param {Function} options.onEnter - 进入状态的全局回调
   * @param {Function} options.onLeave - 离开状态的全局回调
   * @param {Function} options.onTransition - 转换回调 (from, to, event, data)
   */
  constructor(options) {
    if (!options) options = {};
    this.currentState = options.initialState;
    this.states = options.states || {};
    this.onEnter = options.onEnter || null;
    this.onLeave = options.onLeave || null;
    this.onTransition = options.onTransition || null;

    this.history = [];
    this.context = {};

    if (!this.states[this.currentState]) {
      throw new Error("Initial state '" + this.currentState + "' not defined in states");
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @returns {boolean} 是否成功转换
   */
  trigger(event, data) {
    if (data === undefined) data = null;
    var stateDef = this.states[this.currentState];
    if (!stateDef) {
      throw new Error("State '" + this.currentState + "' not found");
    }

    var transitions = stateDef.transitions || {};
    var transition = transitions[event];

    if (!transition) {
      return false;
    }

    var targetState = (typeof transition === 'string') ? transition : transition.target;

    // 检查守卫条件
    var guard = (typeof transition === 'object') ? transition.guard : null;
    if (guard && !guard(this.context, data)) {
      return false;
    }

    var fromState = this.currentState;

    // 离开回调
    if (stateDef.onLeave) stateDef.onLeave(this.context, data);
    if (this.onLeave) this.onLeave(fromState, targetState, event, data);

    // 执行转换
    this.currentState = targetState;

    // 记录历史
    this.history.push({
      from: fromState,
      to: targetState,
      event: event,
      timestamp: Date.now(),
      data: data
    });

    // 进入回调
    var targetDef = this.states[targetState];
    if (targetDef && targetDef.onEnter) targetDef.onEnter(this.context, data);
    if (this.onEnter) this.onEnter(targetState, fromState, event, data);
    if (this.onTransition) this.onTransition(fromState, targetState, event, data);

    return true;
  }

  /**
   * 检查是否可以触发事件
   */
  can(event) {
    var stateDef = this.states[this.currentState];
    if (!stateDef || !stateDef.transitions) return false;

    var transition = stateDef.transitions[event];
    if (!transition) return false;

    var guard = (typeof transition === 'object') ? transition.guard : null;
    if (guard) return guard(this.context);

    return true;
  }

  /**
   * 获取当前状态
   */
  getState() {
    return this.currentState;
  }

  /**
   * 设置上下文数据
   */
  setContext(key, value) {
    this.context[key] = value;
  }

  /**
   * 获取上下文数据
   */
  getContext(key) {
    if (key) return this.context[key];
    var copy = {};
    for (var k in this.context) {
      if (this.context.hasOwnProperty(k)) copy[k] = this.context[k];
    }
    return copy;
  }

  /**
   * 获取转换历史
   */
  getHistory() {
    return this.history.slice();
  }

  /**
   * 重置状态机
   */
  reset() {
    var keys = Object.keys(this.states);
    this.currentState = keys.length > 0 ? keys[0] : null;
    this.history = [];
    this.context = {};
  }

  /**
   * 获取所有可用事件
   */
  getAvailableEvents() {
    var stateDef = this.states[this.currentState];
    if (!stateDef || !stateDef.transitions) return [];

    var result = [];
    var self = this;

    Object.keys(stateDef.transitions).forEach(function(event) {
      var transition = stateDef.transitions[event];
      var guard = (typeof transition === 'object') ? transition.guard : null;
      if (!guard || guard(self.context)) {
        result.push(event);
      }
    });

    return result;
  }
}


// ==================== 导出 ====================

module.exports = {
  LoopController: LoopController,
  RetryStrategy: RetryStrategy,
  CircuitBreaker: CircuitBreaker,
  RateLimiter: RateLimiter,
  StateMachine: StateMachine
};

// ==================== 独立运行演示 ====================

if (require.main === module) {
  (async function() {
    console.log('=== Loop/Workflow Control Demo ===\n');

    // 演示1: 循环控制
    console.log('--- Demo 1: Loop Controller ---');
    var loop = new LoopController({ maxIterations: 5, timeout: 10000 });
    var result = await loop.run(async function(iteration) {
      console.log('  Iteration ' + iteration + '/5');
      return { value: iteration * 2 };
    });
    console.log('  Status: ' + result.reason + ', Iterations: ' + result.iterations);
    console.log();

    // 演示2: 重试策略
    console.log('--- Demo 2: Retry Strategy ---');
    var attemptCount = 0;
    var strategy = new RetryStrategy({
      maxRetries: 3,
      baseDelay: 500,
      backoffType: 'exponential',
      onRetry: function(info) {
        console.log('  ' + info.status + ': attempt ' + info.attempt + '/' + (info.totalRetries + 1));
      }
    });
    var retryResult = await strategy.execute(async function(attempt) {
      attemptCount++;
      if (attemptCount < 3) throw new Error('Attempt ' + attempt + ' failed');
      return 'Success after retries';
    });
    console.log('  Result: ' + (retryResult.success ? 'Success' : 'Failure') + ' after ' + retryResult.attempts + ' attempts');
    console.log();

    // 演示3: 断路器
    console.log('--- Demo 3: Circuit Breaker ---');
    var breaker = new CircuitBreaker({
      failureThreshold: 3,
      openTimeout: 2000,
      halfOpenTimeout: 1000
    });

    breaker.onStateChange = function(change) {
      console.log('  State: ' + change.from + ' -> ' + change.to);
    };

    for (var i = 0; i < 6; i++) {
      try {
        await breaker.call(async function() {
          throw new Error('Service error');
        });
      } catch (e) {
        if (i < 5) console.log('  Call ' + (i + 1) + ' failed: ' + e.message);
      }
    }

    // 等待后尝试探测
    await new Promise(function(r) { setTimeout(r, 2500); });
    try {
      var recovered = await breaker.call(async function() { return 'Recovered!'; });
      console.log('  Circuit recovered after half-open probe');
    } catch (e) {
      console.log('  Probe failed: ' + e.message);
    }
    console.log();

    // 演示4: 速率限制器
    console.log('--- Demo 4: Rate Limiter ---');
    var limiter = new RateLimiter({ tokensPerSecond: 5, bucketSize: 10 });
    var completed = 0;
    for (var j = 0; j < 15; j++) {
      limiter.schedule(async function() {
        completed++;
        return 'done';
      }, { timeout: 5000 }).catch(function() {});
    }
    await new Promise(function(r) { setTimeout(r, 3000); });
    console.log('  Processed ' + completed + '/15 requests (5/sec rate limit)');
    console.log('  Queue status: ' + JSON.stringify({ tokens: Math.floor(limiter.tokens), queueSize: limiter.queue.length }));
    console.log();

    // 演示5: 状态机
    console.log('--- Demo 5: State Machine ---');
    var orderStates = {
      'pending': {
        transitions: {
          'confirm': 'confirmed',
          'cancel': 'cancelled'
        },
        onEnter: function() { console.log('  Entered: pending'); }
      },
      'confirmed': {
        transitions: {
          'ship': { target: 'shipping', guard: function(ctx) { return ctx.paymentReceived === true; } },
          'cancel': 'cancelled'
        },
        onEnter: function() { console.log('  Entered: confirmed'); }
      },
      'shipping': {
        transitions: {
          'deliver': 'delivered',
          'return': 'returned'
        },
        onEnter: function() { console.log('  Entered: shipping'); }
      },
      'delivered': {
        transitions: {},
        onEnter: function() { console.log('  Entered: delivered'); }
      },
      'cancelled': {
        transitions: {},
        onEnter: function() { console.log('  Entered: cancelled'); }
      },
      'returned': {
        transitions: {},
        onEnter: function() { console.log('  Entered: returned'); }
      }
    };

    var order = new StateMachine({ initialState: 'pending', states: orderStates });
    console.log('  Initial state: ' + order.getState());
    order.trigger('confirm');
    console.log('  After confirm: ' + order.getState());
    order.setContext('paymentReceived', true);
    var shipped = order.trigger('ship');
    console.log('  Ship possible: ' + shipped + ', state: ' + order.getState());
    order.trigger('deliver');
    console.log('  Final state: ' + order.getState());
    console.log('  History entries: ' + order.getHistory().length);
    console.log();
  })().catch(function(err) { console.error('Demo error:', err); });
}
