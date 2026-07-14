#!/usr/bin/env node

/**
 * Loop/Workflow Control - 综合演示
 *
 * 展示：循环控制、重试策略、断路器、速率限制、状态机、工作流引擎
 * 运行：node minimal_agent/demos/demo_loop_control.js
 */

var path = require("path");
var lcPath = path.resolve(__dirname, "..", "loop_control");
var wfPath = path.resolve(__dirname, "..", "workflow_engine");

var lc = require(lcPath);
var wf = require(wfPath);

var LoopController = lc.LoopController;
var RetryStrategy = lc.RetryStrategy;
var CircuitBreaker = lc.CircuitBreaker;
var RateLimiter = lc.RateLimiter;
var StateMachine = lc.StateMachine;
var WorkflowEngine = wf.WorkflowEngine;

var totalDemos = 6;

function separator(title) {
  console.log("\n" + "=".repeat(60));
  console.log("  " + title);
  console.log("=".repeat(60));
}

function wait(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

// ==================== Demo 1: 循环控制 ====================

async function demoLoopControl() {
  separator("Demo 1: Loop Controller - 循环控制");

  // 模拟一个迭代优化过程：逐渐逼近目标值
  var loop = new LoopController({
    maxIterations: 20,
    timeout: 5000,
    breakCondition: function(result) {
      return Math.abs(result - 100) < 0.01;
    },
    onProgress: function(info) {
      if (info.iteration % 5 === 0) {
        console.log("  Progress: " + info.iteration + "/" + info.maxIterations + " (elapsed: " + info.elapsed + "ms)");
      }
    }
  });

  console.log("  Running optimization (target=100, max 20 iterations)...");
  var result = await loop.run(async function(iteration, prevResults) {
    var prev = prevResults.length > 0 ? prevResults[prevResults.length - 1] : 0;
    var next = prev + (100 - prev) * 0.5 + Math.random() * 2;
    return next;
  });

  console.log("  Completed: " + result.reason + " after " + result.iterations + " iterations");
  if (result.results.length > 0) {
    console.log("  Final value: " + result.results[result.results.length - 1].toFixed(4));
  }
}

// ==================== Demo 2: 重试策略 ====================

async function demoRetryStrategy() {
  separator("Demo 2: Retry Strategy - 重试策略");

  // 模拟一个不稳定API调用
  var callCount = 0;

  var strategy = new RetryStrategy({
    maxRetries: 4,
    baseDelay: 200,
    backoffType: "exponential",
    onRetry: function(info) {
      if (info.status === "retrying") {
        console.log("  Retry " + info.attempt + "/" + (info.totalRetries + 1) + " (delay: " + info.delay + "ms): " + info.error);
      } else if (info.status === "recovered") {
        console.log("  Recovered after " + info.attempt + " attempts!");
      }
    }
  });

  var result = await strategy.execute(async function(attempt) {
    callCount++;
    console.log("  API call " + attempt + "...");
    await wait(100);
    if (attempt < 3) {
      throw new Error("Network timeout (attempt " + attempt + ")");
    }
    return { status: 200, data: "User profile data" };
  });

  console.log("  Result: " + (result.success ? "Success" : "Failure"));
  console.log("  Total attempts: " + result.attempts);
  if (result.success) {
    console.log("  Response: " + JSON.stringify(result.result));
  }

  // 演示不同退避策略
  console.log("\n  Backoff strategies (base=1000ms):");
  var fixed = new RetryStrategy({ baseDelay: 1000, backoffType: "fixed" });
  var linear = new RetryStrategy({ baseDelay: 1000, backoffType: "linear" });
  var exp = new RetryStrategy({ baseDelay: 1000, backoffType: "exponential" });

  for (var i = 1; i <= 4; i++) {
    console.log("    Attempt " + i + ": fixed=" + fixed.calculateDelay(i).toFixed(0) + "ms," +
      " linear=" + linear.calculateDelay(i).toFixed(0) + "ms," +
      " exp=" + exp.calculateDelay(i).toFixed(0) + "ms");
  }
}

// ==================== Demo 3: 断路器 ====================

async function demoCircuitBreaker() {
  separator("Demo 3: Circuit Breaker - 断路器");

  var breaker = new CircuitBreaker({
    failureThreshold: 3,
    openTimeout: 1500,
    halfOpenTimeout: 1000,
    onStateChange: function(change) {
      console.log("  STATE CHANGE: " + change.from + " -> " + change.to);
    }
  });

  async function unreliableService() {
    await wait(50);
    throw new Error("Service unavailable");
  }

  async function callBreaker(n) {
    try {
      var result = await breaker.call(unreliableService);
      console.log("  Call " + n + ": Success - " + result);
    } catch (e) {
      console.log("  Call " + n + ": Failed - " + e.message);
    }
  }

  console.log("  Failing calls to trigger circuit breaker...");
  for (var i = 1; i <= 5; i++) {
    await callBreaker(i);
  }

  console.log("\n  Waiting for open timeout (" + breaker.openTimeout + "ms)...");
  console.log("  State: " + breaker.state);

  await wait(2000);
  console.log("\n  Attempting half-open probe...");
  await callBreaker(6);
  console.log("  State after probe: " + breaker.state);

  breaker.reset();
  console.log("\n  After manual reset: " + breaker.state);

  console.log("\n  Metrics: " + breaker.metrics.successfulCalls + " success, " +
    breaker.metrics.failedCalls + " failed, " + breaker.metrics.rejectedCalls + " rejected");
}

// ==================== Demo 4: 速率限制器 ====================

async function demoRateLimiter() {
  separator("Demo 4: Rate Limiter - 速率限制器");

  var limiter = new RateLimiter({ tokensPerSecond: 3, bucketSize: 5 });

  console.log("  Rate limit: 3 req/s, burst: 5 requests");
  console.log("  Firing 10 concurrent requests...\n");

  var startTime = Date.now();
  var completed = 0;
  var rejected = 0;

  var promises = [];
  for (var i = 0; i < 10; i++) {
    (function(reqId) {
      var p = limiter.schedule(async function() {
        await wait(200);
        return "req" + reqId;
      }, { timeout: 3000, priority: reqId <= 3 ? "high" : "normal" }).then(function(result) {
        completed++;
        var elapsed = Date.now() - startTime;
        console.log("  [" + elapsed + "ms] Request " + reqId + " completed (" + result + ")");
      }).catch(function(err) {
        rejected++;
        console.log("  Request " + reqId + " rejected: " + err.message);
      });
      promises.push(p);
    })(i + 1);
  }

  await Promise.all(promises);

  var totalTime = Date.now() - startTime;
  console.log("\n  Total: " + completed + " completed, " + rejected + " rejected in " + totalTime + "ms");
  console.log("  Peak queue: " + limiter.metrics.peakQueueSize);
}

// ==================== Demo 5: 状态机 ====================

async function demoStateMachine() {
  separator("Demo 5: State Machine - 状态机");

  // 模拟一个任务处理流程的状态机
  var taskStates = {
    "created": {
      transitions: {
        "start": "running",
        "archive": "archived"
      },
      onEnter: function() { console.log("  [Task] Created"); },
      onLeave: function() { console.log("  [Task] Leaving created state"); }
    },
    "running": {
      transitions: {
        "complete": { target: "completed", guard: function(ctx) { return ctx.allTestsPassed === true; } },
        "fail": "failed",
        "pause": "paused"
      },
      onEnter: function() { console.log("  [Task] Running..."); }
    },
    "paused": {
      transitions: {
        "resume": "running",
        "fail": "failed"
      },
      onEnter: function() { console.log("  [Task] Paused"); }
    },
    "completed": {
      transitions: {},
      onEnter: function() { console.log("  [Task] Completed!"); }
    },
    "failed": {
      transitions: {
        "retry": "running"
      },
      onEnter: function() { console.log("  [Task] Failed"); }
    },
    "archived": {
      transitions: {},
      onEnter: function() { console.log("  [Task] Archived"); }
    }
  };

  var task = new StateMachine({ initialState: "created", states: taskStates });

  console.log("  Initial: " + task.getState());
  console.log("  Available events: " + task.getAvailableEvents().join(", "));

  task.trigger("start");
  console.log("  After start: " + task.getState());

  task.trigger("pause");
  console.log("  After pause: " + task.getState());

  task.trigger("resume");
  console.log("  After resume: " + task.getState());

  // 尝试完成（守卫条件不满足）
  var completed = task.trigger("complete");
  console.log("  Try complete (tests not passed): " + completed + " (state: " + task.getState() + ")");

  task.setContext("allTestsPassed", true);
  // 再试一次
  completed = task.trigger("complete");
  console.log("  Try complete (tests passed): " + completed + " (state: " + task.getState() + ")");

  console.log("  History (" + task.getHistory().length + " transitions):");
  task.getHistory().forEach(function(h) {
    console.log("    " + h.from + " --[" + h.event + "]--> " + h.to);
  });
}

// ==================== Demo 6: 工作流引擎 ====================

async function demoWorkflowEngine() {
  separator("Demo 6: Workflow Engine - DAG工作流引擎");

  // 构建一个数据处理流水线
  var pipeline = new WorkflowEngine("data-pipeline", {
    maxConcurrency: 3
  });

  pipeline.addNodes({
    "fetch": {
      name: "数据获取",
      execute: async function(ctx) {
        console.log("    [fetch] Downloading data...");
        await wait(500);
        ctx.rawData = [12, 45, 78, 23, 56, 91, 34, 67];
        return { source: "API", count: ctx.rawData.length };
      }
    },
    "validate": {
      name: "数据验证",
      execute: async function(ctx) {
        console.log("    [validate] Checking data quality...");
        await wait(300);
        if (!ctx.rawData || ctx.rawData.length === 0) {
          throw new Error("Empty data set");
        }
        ctx.validated = true;
        return { valid: true, total: ctx.rawData.length };
      },
      dependsOn: ["fetch"]
    },
    "analyze": {
      name: "数据分析",
      execute: async function(ctx) {
        console.log("    [analyze] Computing statistics...");
        await wait(700);
        var sum = ctx.rawData.reduce(function(a, b) { return a + b; }, 0);
        var avg = sum / ctx.rawData.length;
        var max = Math.max.apply(null, ctx.rawData);
        var min = Math.min.apply(null, ctx.rawData);
        ctx.stats = { sum: sum, avg: avg, max: max, min: min };
        return ctx.stats;
      },
      dependsOn: ["validate"]
    },
    "report": {
      name: "报告生成",
      execute: async function(ctx) {
        console.log("    [report] Generating report...");
        await wait(400);
        var report = {
          title: "Data Analysis Report",
          generatedAt: new Date().toISOString(),
          totalItems: ctx.rawData.length,
          statistics: ctx.stats,
          status: "completed"
        };
        return report;
      },
      dependsOn: ["analyze"]
    },
    "notify": {
      name: "通知发送",
      execute: async function(ctx) {
        console.log("    [notify] Sending notification...");
        await wait(200);
        return { notified: true, channel: "console" };
      },
      dependsOn: ["report"],
      options: {
        condition: function(ctx) { return ctx.stats && ctx.stats.avg > 0; }
      }
    }
  });

  console.log("  Workflow DAG:");
  console.log(pipeline.toMermaid());

  console.log("\n  Running pipeline...");
  var result = await pipeline.run();

  var status = pipeline.getStatus();
  console.log("\n  Pipeline status: " + status.status);
  console.log("  Duration: " + status.duration + "ms");
  console.log("  Nodes: " + status.completedNodes + " completed, " + status.failedNodes + " failed");

  if (result.success && result.context && result.context.stats) {
    var stats = result.context.stats;
    console.log("\n  Analysis Results:");
    console.log("    Sum: " + stats.sum);
    console.log("    Average: " + stats.avg.toFixed(2));
    console.log("    Max: " + stats.max);
    console.log("    Min: " + stats.min);
  }
}

// ==================== 主入口 ====================

async function main() {
  console.log("\n" + "#".repeat(60));
  console.log("#  Loop/Workflow Control - 综合演示");
  console.log("#".repeat(60));
  console.log("\n  共 " + totalDemos + " 个演示模块\n");

  try { await demoLoopControl(); } catch (e) { console.log("  [ERROR] Demo 1: " + e.message); }
  try { await demoRetryStrategy(); } catch (e) { console.log("  [ERROR] Demo 2: " + e.message); }
  try { await demoCircuitBreaker(); } catch (e) { console.log("  [ERROR] Demo 3: " + e.message); }
  try { await demoRateLimiter(); } catch (e) { console.log("  [ERROR] Demo 4: " + e.message); }
  try { await demoStateMachine(); } catch (e) { console.log("  [ERROR] Demo 5: " + e.message); }
  try { await demoWorkflowEngine(); } catch (e) { console.log("  [ERROR] Demo 6: " + e.message); }

  console.log("\n" + "#".repeat(60));
  console.log("#  演示完成！");
  console.log("#".repeat(60) + "\n");
}

main().catch(function(e) { console.error("Demo failed:", e); process.exit(1); });
