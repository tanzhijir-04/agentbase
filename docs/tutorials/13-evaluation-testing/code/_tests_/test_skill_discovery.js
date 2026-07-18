#!/usr/bin/env node

const { SkillDiscovery, YamlFrontMatterParser, registerPresetSkills } = require("../skill_discovery");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) { passed++; console.log("  ✅ " + message); }
  else { failed++; console.log("  ❌ " + message); }
}

async function runTests() {
  console.log("# Skill Discovery 测试（SKILL.md 模式）");
  console.log("=".repeat(55));

  // ========== Test 1: YAML Front Matter 解析 ==========
  console.log("\n## Test 1: YAML Front Matter 解析");
  const sample = [
    "---",
    "name: test-skill",
    "description: 测试技能。触发词包括：测试、test",
    "metadata:",
    "  key: value",
    "---",
    "",
    "# Test Skill",
    "这是技能指令内容"
  ].join("\n");

  const parsed = YamlFrontMatterParser.parse(sample);
  assert(parsed.name === "test-skill", "解析出 name");
  assert(parsed.description.includes("测试技能"), "解析出 description");
  assert(parsed._body !== undefined && parsed._body.length > 0, "解析出 body");

  // ========== Test 2: SKILL.md 文件发现 ==========
  console.log("\n## Test 2: SKILL.md 文件发现");
  const discovery = new SkillDiscovery();
  discovery.setLogger({ log: () => {}, warn: () => {}, error: () => {} });
  discovery.addSearchDirectory("C:/Users/20300/Desktop/AI-Agent-Study/skills/example-skills");
  const discovered = discovery.discoverSkills();
  assert(discovered.length >= 5, "发现至少5个示例技能");
  assert(discovery.listSkills().length >= 5, "listSkills 返回正确数量");

  // ========== Test 3: 技能元数据查询 ==========
  console.log("\n## Test 3: 技能元数据");
  const translation = discovery.getSkill("translation");
  assert(translation !== null, "translation 技能存在");
  assert(translation.description.includes("翻译"), "description 包含关键词");
  assert(translation.filePath !== null, "filePath 不为空");
  assert(translation.bodyLength > 0, "body 内容非空");

  // ========== Test 4: getSkillBody ==========
  console.log("\n## Test 4: getSkillBody");
  const body = discovery.getSkillBody("translation");
  assert(body !== null, "能获取到 body 内容");
  assert(body.includes("翻译"), "body 包含翻译相关指令");

  // ========== Test 5: 关键词提取 ==========
  console.log("\n## Test 5: 触发词提取");
  const triggers = discovery.extractTriggers("翻译技能。触发词包括：翻译、translate、译成、怎么翻译");
  assert(triggers.length >= 3, "提取至少3个触发词");
  assert(triggers.includes("翻译"), "包含'翻译'");
  assert(triggers.includes("translate"), "包含'translate'");

  // ========== Test 6: 输入匹配 ==========
  console.log("\n## Test 6: 输入匹配");
  // 先注册内存技能用于匹配测试
  registerPresetSkills(discovery);

  let match = discovery.matchInput("今天天气怎么样");
  assert(match !== null && match.skill === "weather", "天气匹配到 weather");

  match = discovery.matchInput("帮我翻译这段话");
  assert(match !== null && match.skill === "translation", "翻译匹配到 translation");

  match = discovery.matchInput("你好");
  assert(match !== null && match.skill === "greeting", "你好匹配到 greeting");

  match = discovery.matchInput("完全无关的内容abcxyz");
  assert(match === null, "无匹配返回 null");

  // ========== Test 7: searchSkills ==========
  console.log("\n## Test 7: 搜索查询");
  let results = discovery.searchSkills("翻译");
  assert(results.length > 0, "搜索'翻译'返回结果");
  assert(results[0].skill === "translation", "第一个结果是 translation");

  results = discovery.searchSkills("不存在的技能xxx");
  assert(results.length === 0, "搜索不存在的技能返回空");

  // ========== Test 8: 手动注册 ==========
  console.log("\n## Test 8: 手动注册");
  assert(discovery.registerSkill({ name: "custom", description: "自定义技能", body: "指令" }) === true, "手动注册成功");
  assert(discovery.registerSkill({ name: "custom" }) === false, "重复注册失败");
  assert(discovery.getSkill("custom") !== null, "注册后可查询");

  // ========== Test 9: 边界情况 ==========
  console.log("\n## Test 9: 边界情况");
  assert(discovery.matchInput(null) === null, "null 输入返回 null");
  assert(discovery.matchInput("") === null, "空输入返回 null");
  assert(discovery.searchSkills(null).length === 0, "null 搜索返回空数组");

  // ========== 汇总 ==========
  console.log("\n" + "=".repeat(55));
  console.log("测试完成: " + passed + " passed, " + failed + " failed");
  console.log("=".repeat(55));
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => { console.error(err); process.exit(1); });
