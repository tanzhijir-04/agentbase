/**
 * Workflow Engine - 测试脚本
 * 运行：node minimal_agent/tests/test_workflow_engine.js
 */

var path = require("path");
var modPath = path.resolve(__dirname, "..", "workflow_engine");
var mod = require(modPath);

var WorkflowEngine = mod.WorkflowEngine;

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

// ==================== 测试 ====================

console.log("\n=== Test: WorkflowEngine ===");

testSync("WorkflowEngine: create and add nodes", function(done) {
  var wf = new WorkflowEngine("test");
  wf.addNode("a", { execute: async function() { return 1; } });
  wf.addNode("b", { execute: async function() { return 2; }, dependsOn: ["a"] });
  var status = wf.getStatus();
  assertEqual(status.totalNodes, 2);
  assertEqual(status.name, "test");
  done();
});

test("WorkflowEngine: simple linear workflow", function(done) {
  var wf = new WorkflowEngine("linear");
  wf.addNodes({
    "step1": { execute: async function(ctx) { ctx.val = 1; } },
    "step2": { execute: async function(ctx) { return ctx.val + 1; }, dependsOn: ["step1"] },
    "step3": { execute: async function(ctx) { return ctx.val + 2; }, dependsOn: ["step2"] }
  });
  wf.run().then(function(result) {
    assertEqual(result.success, true);
    done();
  }).catch(done);
});

test("WorkflowEngine: parallel execution", function(done) {
  var wf = new WorkflowEngine("parallel", { maxConcurrency: 5 });
  wf.addNodes({
    "start": { execute: async function(ctx) { ctx.data = "ready"; } },
    "a": { execute: async function() { return "A"; }, dependsOn: ["start"] },
    "b": { execute: async function() { return "B"; }, dependsOn: ["start"] },
    "end": { execute: async function(ctx) { return "done"; }, dependsOn: ["a", "b"] }
  });
  wf.run().then(function(result) {
    assertEqual(result.success, true);
    var status = wf.getStatus();
    assertEqual(status.completedNodes, 4);
    done();
  }).catch(done);
});

test("WorkflowEngine: node failure propagation", function(done) {
  var wf = new WorkflowEngine("failure-test");
  wf.addNodes({
    "a": { execute: async function() { return 1; } },
    "b": { execute: async function() { throw new Error("B failed"); }, dependsOn: ["a"] },
    "c": { execute: async function() { return 3; }, dependsOn: ["b"] }
  });
  wf.run().then(function(result) {
    assertEqual(result.success, false);
    assertEqual(result.reason, "blocked");
    done();
  }).catch(done);
});

test("WorkflowEngine: conditional skip", function(done) {
  var wf = new WorkflowEngine("conditional");
  wf.addNodes({
    "check": { execute: async function(ctx) { ctx.shouldProcess = false; } },
    "process": {
      execute: async function() { return "processed"; },
      dependsOn: ["check"],
      options: { condition: function(ctx) { return ctx.shouldProcess === true; } }
    },
    "finish": { execute: async function() { return "done"; }, dependsOn: ["check"] }
  });
  wf.run().then(function(result) {
    assertEqual(result.success, true);
    var status = wf.getStatus();
    assertEqual(status.nodes.process.status, "skipped");
    done();
  }).catch(done);
});

test("WorkflowEngine: node timeout", function(done) {
  var wf = new WorkflowEngine("timeout-test");
  wf.addNode("slow", {
    execute: async function() {
      await new Promise(function(r) { setTimeout(r, 500); });
      return "too late";
    },
    options: { timeout: 100 }
  });
  wf.run().then(function(result) {
    assertEqual(result.success, false);
    var status = wf.getStatus();
    assertEqual(status.failedNodes, 1);
    done();
  }).catch(done);
});

test("WorkflowEngine: context passing", function(done) {
  var wf = new WorkflowEngine("context-test");
  wf.setContext("initial", "hello");
  wf.addNode("greet", {
    execute: async function(ctx) { ctx.greeting = ctx.initial + " world"; return ctx.greeting; }
  });
  wf.addNode("echo", {
    execute: async function(ctx) { return ctx.greeting; },
    dependsOn: ["greet"]
  });
  wf.run().then(function(result) {
    assertEqual(result.success, true);
    assertEqual(result.context.greeting, "hello world");
    done();
  }).catch(done);
});

test("WorkflowEngine: getStatus after run", function(done) {
  var wf = new WorkflowEngine("status-check");
  wf.addNode("a", { execute: async function() { return 1; } });
  wf.run().then(function() {
    var status = wf.getStatus();
    assertEqual(status.status, "completed");
    assertEqual(status.totalNodes, 1);
    assertEqual(status.completedNodes, 1);
    assertTrue(status.duration > 0);
    done();
  }).catch(done);
});

testSync("WorkflowEngine: toMermaid output", function(done) {
  var wf = new WorkflowEngine("mermaid");
  wf.addNodes({
    "a": { execute: async function() {} },
    "b": { execute: async function() {}, dependsOn: ["a"] },
    "c": { execute: async function() {}, dependsOn: ["a"] },
    "d": { execute: async function() {}, dependsOn: ["b", "c"] }
  });
  var mermaid = wf.toMermaid();
  assertTrue(mermaid.indexOf("graph TD") >= 0);
  assertTrue(mermaid.indexOf("a-->b") >= 0 || mermaid.indexOf("a-->") >= 0);
  done();
});

test("WorkflowEngine: reset", function(done) {
  var wf = new WorkflowEngine("reset-test");
  wf.addNode("a", { execute: async function() { return 1; } });
  wf.run().then(function() {
    assertEqual(wf.getStatus().status, "completed");
    wf.reset();
    var status = wf.getStatus();
    assertEqual(status.status, "idle");
    assertEqual(status.eventLogSize, 0);
    done();
  }).catch(done);
});

runAndExit();
