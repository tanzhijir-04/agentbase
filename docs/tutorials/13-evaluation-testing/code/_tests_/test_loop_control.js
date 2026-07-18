/**
 * Loop/Workflow Control - 测试脚本
 * 运行：node minimal_agent/tests/test_loop_control.js
 */

var path = require("path");
var modPath = path.resolve(__dirname, "..", "loop_control");
var mod = require(modPath);

var LoopController = mod.LoopController;
var RetryStrategy = mod.RetryStrategy;
var CircuitBreaker = mod.CircuitBreaker;
var RateLimiter = mod.RateLimiter;
var StateMachine = mod.StateMachine;

var passed = 0;
var failed = 0;
var pendingAsync = 0;

function test(name, fn) {
  pendingAsync++;
  fn(function(err) {
    pendingAsync--;
    if (err) {
      console.log("  FAIL: " + name + " - " + err.message);
      failed++;
    } else {
      console.log("  PASS: " + name);
      passed++;
    }
  });
}

function testSync(name, fn) {
  fn(function(err) {
    if (err) {
      console.log("  FAIL: " + name + " - " + err.message);
      failed++;
    } else {
      console.log("  PASS: " + name);
      passed++;
    }
  });
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error((msg || "") + " expected " + JSON.stringify(expected) + " but got " + JSON.stringify(actual));
  }
}

function assertTrue(value, msg) {
  if (!value) throw new Error(msg || "Expected true");
}

function runAndExit() {
  var checkInterval = setInterval(function() {
    if (pendingAsync === 0) {
      clearInterval(checkInterval);
      console.log("\n" + "=".repeat(50));
      console.log("Results: " + passed + " passed, " + failed + " failed");
      console.log("=".repeat(50) + "\n");
      process.exit(failed > 0 ? 1 : 0);
    }
  }, 10);
}

// ==================== LoopController Tests ====================

console.log("\n=== Test: LoopController ===");

test("LoopController: basic iteration", function(done) {
  var loop = new LoopController({ maxIterations: 5, timeout: 10000 });
  loop.run(async function(iteration) { return iteration; }).then(function(result) {
    assertEqual(result.success, true);
    assertEqual(result.iterations, 5);
    assertEqual(result.reason, "completed");
    done();
  }).catch(done);
});

test("LoopController: early break condition", function(done) {
  var loop = new LoopController({ maxIterations: 100, timeout: 10000, breakCondition: function(r) { return r >= 3; } });
  loop.run(async function(iteration) { return iteration; }).then(function(result) {
    assertEqual(result.success, true);
    assertEqual(result.reason, "break_condition");
    assertTrue(result.iterations < 100);
    done();
  }).catch(done);
});

test("LoopController: timeout detection", function(done) {
  var loop = new LoopController({ maxIterations: 100, timeout: 100 });
  loop.run(async function() { await new Promise(function(r) { setTimeout(r, 30); }); return 1; }).then(function(result) {
    assertEqual(result.success, false);
    assertEqual(result.reason, "timeout");
    done();
  }).catch(done);
});

testSync("LoopController: getStatus", function(done) {
  var loop = new LoopController({ maxIterations: 10, timeout: 5000 });
  assertEqual(loop.getStatus().isRunning, false);
  done();
});

test("LoopController: reset", function(done) {
  var loop = new LoopController({ maxIterations: 3, timeout: 5000 });
  loop.run(async function(i) { return i; }).then(function() {
    assertEqual(loop.iterationCount, 3);
    loop.reset();
    assertEqual(loop.iterationCount, 0);
    assertEqual(loop.isRunning, false);
    assertEqual(loop.history.length, 0);
    done();
  }).catch(done);
});

// ==================== RetryStrategy Tests ====================

console.log("\n=== Test: RetryStrategy ===");

test("RetryStrategy: success without retry", function(done) {
  var s = new RetryStrategy({ maxRetries: 3 });
  s.execute(async function() { return "ok"; }).then(function(r) {
    assertEqual(r.success, true);
    assertEqual(r.attempts, 1);
    done();
  }).catch(done);
});

test("RetryStrategy: recover after retries", function(done) {
  var count = 0;
  var s = new RetryStrategy({ maxRetries: 3, baseDelay: 50 });
  s.execute(async function() { count++; if (count < 3) throw new Error("fail"); return "ok"; }).then(function(r) {
    assertEqual(r.success, true);
    assertEqual(r.attempts, 3);
    done();
  }).catch(done);
});

test("RetryStrategy: exceed max retries", function(done) {
  var s = new RetryStrategy({ maxRetries: 2, baseDelay: 50 });
  s.execute(async function() { throw new Error("persistent"); }).then(function(r) {
    assertEqual(r.success, false);
    assertEqual(r.attempts, 3);
    done();
  }).catch(done);
});

testSync("RetryStrategy: exponential backoff", function(done) {
  var s = new RetryStrategy({ baseDelay: 1000, backoffType: "exponential" });
  assertTrue(s.calculateDelay(1) >= 1000 && s.calculateDelay(1) <= 1100);
  assertTrue(s.calculateDelay(3) >= 4000 && s.calculateDelay(3) <= 4400);
  done();
});

testSync("RetryStrategy: fixed backoff", function(done) {
  var s = new RetryStrategy({ baseDelay: 500, backoffType: "fixed" });
  assertTrue(s.calculateDelay(1) >= 500 && s.calculateDelay(1) <= 550);
  assertTrue(s.calculateDelay(5) >= 500 && s.calculateDelay(5) <= 550);
  done();
});

// ==================== CircuitBreaker Tests ====================

console.log("\n=== Test: CircuitBreaker ===");

testSync("CircuitBreaker: starts closed", function(done) {
  assertEqual(new CircuitBreaker().state, "closed");
  done();
});

test("CircuitBreaker: opens after failures", function(done) {
  var cb = new CircuitBreaker({ failureThreshold: 3, openTimeout: 5000 });
  async function fail() { throw new Error("err"); }
  Promise.all([
    cb.call(fail).catch(function() {}),
    cb.call(fail).catch(function() {}),
    cb.call(fail).catch(function() {})
  ]).then(function() {
    assertEqual(cb.state, "open");
    assertEqual(cb.failureCount, 3);
    done();
  }).catch(done);
});

test("CircuitBreaker: rejects when open", function(done) {
  var cb = new CircuitBreaker({ failureThreshold: 2, openTimeout: 5000 });
  async function fail() { throw new Error("err"); }
  Promise.all([
    cb.call(fail).catch(function() {}),
    cb.call(fail).catch(function() {})
  ]).then(function() {
    cb.call(fail).catch(function(err) {
      assertTrue(err.message.indexOf("OPEN") >= 0);
      assertEqual(cb.metrics.rejectedCalls, 1);
      done();
    });
  });
});

test("CircuitBreaker: half-open probe", function(done) {
  var cb = new CircuitBreaker({ failureThreshold: 2, openTimeout: 100, halfOpenTimeout: 500 });
  async function fail() { throw new Error("err"); }
  Promise.all([
    cb.call(fail).catch(function() {}),
    cb.call(fail).catch(function() {})
  ]).then(function() {
    assertEqual(cb.state, "open");
  setTimeout(function() {
      // 触发探测：canProceed 在 call() 中自动转换状态
      cb.call(async function() { return "probe"; }).catch(function() {});
      assertEqual(cb.state, "half-open");
      done();
    }, 200);
  });
});

test("CircuitBreaker: reset after success in half-open", function(done) {
  var cb = new CircuitBreaker({ failureThreshold: 2, openTimeout: 100, successThreshold: 1 });
  async function fail() { throw new Error("err"); }
  Promise.all([
    cb.call(fail).catch(function() {}),
    cb.call(fail).catch(function() {})
  ]).then(function() {
    setTimeout(function() {
      cb.call(async function() { return "ok"; }).then(function() {
        assertEqual(cb.state, "closed");
        assertEqual(cb.failureCount, 0);
        done();
      }).catch(done);
    }, 200);
  });
});

testSync("CircuitBreaker: forceOpen and reset", function(done) {
  var cb = new CircuitBreaker();
  cb.forceOpen();
  assertEqual(cb.state, "open");
  cb.reset();
  assertEqual(cb.state, "closed");
  done();
});

testSync("CircuitBreaker: getStatus", function(done) {
  assertEqual(new CircuitBreaker({ failureThreshold: 5 }).getStatus().state, "closed");
  done();
});

// ==================== RateLimiter Tests ====================

console.log("\n=== Test: RateLimiter ===");

test("RateLimiter: direct execution", function(done) {
  var lim = new RateLimiter({ tokensPerSecond: 100, bucketSize: 50 });
  lim.schedule(async function() { return "fast"; }).then(function(r) {
    assertEqual(r, "fast");
    done();
  }).catch(done);
});

test("RateLimiter: reject when tokens exhausted", function(done) {
  var lim = new RateLimiter({ tokensPerSecond: 1, bucketSize: 1 });
  lim.schedule(async function() { return "a"; }).then(function() {
    return lim.schedule(async function() { return "b"; }, { timeout: 0 });
  }).then(function() {
    done(new Error("Should have been rejected"));
  }).catch(function(err) {
    assertTrue(err.message.indexOf("Rate limited") >= 0);
    done();
  });
});

test("RateLimiter: queue with timeout", function(done) {
  this.timeout = 5000;
  var lim = new RateLimiter({ tokensPerSecond: 10, bucketSize: 1 });
  lim.schedule(async function() {
    await new Promise(function(r) { setTimeout(r, 100); });
    return "first";
  });
  lim.schedule(async function() { return "second"; }, { timeout: 5000 }).then(function(r) {
    assertEqual(r, "second");
    done();
  }).catch(done);
});

testSync("RateLimiter: getStatus", function(done) {
  var lim = new RateLimiter({ tokensPerSecond: 10, bucketSize: 20 });
  assertEqual(lim.getStatus().tokens, 20);
  done();
});

// ==================== StateMachine Tests ====================

console.log("\n=== Test: StateMachine ===");

testSync("StateMachine: initial state", function(done) {
  var sm = new StateMachine({ initialState: "a", states: { a: { transitions: { go: "b" } }, b: { transitions: {} } } });
  assertEqual(sm.getState(), "a");
  done();
});

testSync("StateMachine: valid transition", function(done) {
  var sm = new StateMachine({ initialState: "a", states: { a: { transitions: { go: "b" } }, b: { transitions: {} } } });
  assertEqual(sm.trigger("go"), true);
  assertEqual(sm.getState(), "b");
  done();
});

testSync("StateMachine: invalid event", function(done) {
  var sm = new StateMachine({ initialState: "a", states: { a: { transitions: {} } } });
  assertEqual(sm.trigger("nope"), false);
  assertEqual(sm.getState(), "a");
  done();
});

testSync("StateMachine: guard condition", function(done) {
  var sm = new StateMachine({
    initialState: "pending",
    states: { pending: { transitions: { approve: { target: "done", guard: function(ctx) { return ctx.role === "admin"; } } } }, done: { transitions: {} } }
  });
  assertEqual(sm.trigger("approve"), false);
  sm.setContext("role", "admin");
  assertEqual(sm.trigger("approve"), true);
  done();
});

testSync("StateMachine: history", function(done) {
  var sm = new StateMachine({ initialState: "a", states: { a: { transitions: { go: "b" } }, b: { transitions: { go: "c" } }, c: { transitions: {} } } });
  sm.trigger("go"); sm.trigger("go");
  assertEqual(sm.getHistory().length, 2);
  done();
});

testSync("StateMachine: available events", function(done) {
  var sm = new StateMachine({ initialState: "a", states: { a: { transitions: { x: "b", y: "c" } }, b: { transitions: {} }, c: { transitions: {} } } });
  assertEqual(sm.getAvailableEvents().length, 2);
  done();
});

testSync("StateMachine: lifecycle callbacks", function(done) {
  var log = [];
  var sm = new StateMachine({
    initialState: "a", states: { a: { transitions: { go: "b" }, onLeave: function() { log.push("leave"); } }, b: { transitions: {}, onEnter: function() { log.push("enter"); } } }
  });
  sm.trigger("go");
  assertEqual(log.length, 2);
  done();
});

// ==================== 启动退出监控 ====================

runAndExit();
