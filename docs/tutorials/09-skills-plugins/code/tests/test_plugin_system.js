#!/usr/bin/env node

const { SkillDiscovery } = require("../skill_discovery");
const { PluginSystem } = require("../plugin_system");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) { passed++; console.log("  ✅ " + message); }
  else { failed++; console.log("  ❌ " + message); }
}

async function runTests() {
  console.log("# Plugin System 测试（SKILL.md 模式）");
  console.log("=".repeat(55));

  // ========== Test 1: 插件注册 ==========
  console.log("\n## Test 1: 插件注册");
  const ps = new PluginSystem();
  ps.setLogger({ log: () => {}, warn: () => {}, error: () => {} });

  assert(ps.registerPlugin({ name: "test-plugin", version: "1.0.0", description: "测试" }) === true, "注册成功");
  assert(ps.registerPlugin({ name: "test-plugin" }) === false, "重复注册失败");
  assert(ps.registerPlugin({}) === false, "无名称失败");

  // ========== Test 2: 状态管理 ==========
  console.log("\n## Test 2: 状态管理");
  let p = ps.getPlugin("test-plugin");
  assert(p !== null, "getPlugin 非空");
  assert(p.status === "registered", "初始状态为 registered");
  assert(p.version === "1.0.0", "版本正确");

  assert(ps.listPlugins().length === 1, "listPlugins 正确");

  // ========== Test 3: 启用/禁用 ==========
  console.log("\n## Test 3: 启用/禁用生命周期");
  assert(ps.enablePlugin("test-plugin") === true, "启用成功");
  p = ps.getPlugin("test-plugin");
  assert(p.status === "enabled", "启用后状态 enabled");

  assert(ps.disablePlugin("test-plugin") === true, "禁用成功");
  p = ps.getPlugin("test-plugin");
  assert(p.status === "disabled", "禁用后状态 disabled");

  assert(ps.disablePlugin("nonexistent") === false, "不存在的插件失败");

  // ========== Test 4: 内存插件启用 ==========
  console.log("\n## Test 4: 内存插件 Skill 注册");
  const ps2 = new PluginSystem();
  ps2.setLogger({ log: () => {}, warn: () => {}, error: () => {} });

  ps2.registerPlugin({
    name: "text-helper",
    displayName: "文本辅助",
    version: "1.0.0",
    skills: ["char-counter", "case-converter"]
  });
  assert(ps2.enablePlugin("text-helper") === true, "内存插件启用成功");
  assert(ps2.getPlugin("text-helper").status === "enabled", "内存插件状态正确");

  // ========== Test 5: 文件插件发现 ==========
  console.log("\n## Test 5: 文件插件发现");
  const ps3 = new PluginSystem();
  ps3.setLogger({ log: () => {}, warn: () => {}, error: () => {} });
  ps3.addPluginDirectory("C:/Users/20300/Desktop/AI-Agent-Study/plugins");
  const discovered = ps3.discoverPlugins();
  assert(discovered.length >= 2, "发现至少2个插件（text-processing, network-tools, dev-tools）");

  const textP = ps3.getPlugin("text-processing");
  assert(textP !== null, "text-processing 被发现");
  assert(textP.description.includes("文本"), "description 包含'文本'");

  // ========== Test 6: 文件插件启用并发现技能 ==========
  console.log("\n## Test 6: 文件插件启用 + SKILL.md 发现");
  assert(ps3.enablePlugin("text-processing") === true, "启用 text-processing");
  const enabledP = ps3.getPlugin("text-processing");
  assert(enabledP.status === "enabled", "状态为 enabled");
  assert(enabledP.skills.length >= 1, "发现了 SKILL.md 技能");

  // 验证 skillDiscovery 中也注册了技能
  const sd = ps3.getSkillDiscovery();
  const charCounter = sd.getSkill("char-counter");
  assert(charCounter !== null, "char-counter 技能被 skillDiscovery 发现");

  // ========== Test 7: 插件依赖 ==========
  console.log("\n## Test 7: 插件依赖");
  const networkP = ps3.getPlugin("network-tools");
  assert(networkP !== null, "network-tools 存在");

  assert(ps3.enablePlugin("network-tools") === true, "启用 network-tools");
  // dev-tools 依赖 text-processing
  const devP = ps3.getPlugin("dev-tools");
  if (devP) {
    assert(devP.dependencies.includes("text-processing"), "dev-tools 依赖 text-processing");
  }

  // ========== Test 8: 批量操作 ==========
  console.log("\n## Test 8: 批量操作");
  const all = ps3.listPlugins();
  assert(all.length >= 2, "多个插件存在");

  const disabled = ps3.disableAllPlugins();
  assert(disabled.length > 0, "批量禁用成功");
  const afterDisable = ps3.listPlugins();
  assert(afterDisable.every(p => p.status !== "enabled"), "全部已禁用");

  // ========== Test 9: 移除插件 ==========
  console.log("\n## Test 9: 移除插件");
  assert(ps3.removePlugin("test-plugin") === true, "移除成功");
  assert(ps3.getPlugin("test-plugin") === null, "移除后不可查询");

  // ========== Test 10: 系统状态 ==========
  console.log("\n## Test 10: 系统状态");
  const status = ps3.getStatus();
  assert(status.totalPlugins > 0, "totalPlugins 正确");
  assert(typeof status.enabled === "number", "enabled 字段类型正确");

  // ========== 汇总 ==========
  console.log("\n" + "=".repeat(55));
  console.log("测试完成: " + passed + " passed, " + failed + " failed");
  console.log("=".repeat(55));
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => { console.error(err); process.exit(1); });
