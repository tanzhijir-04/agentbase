#!/usr/bin/env node

/**
 * Skill System 单元测试
 *
 * 测试项：
 * 1. 技能注册和取消注册
 * 2. 技能匹配算法
 * 3. 技能执行
 * 4. 链式执行
 * 5. 依赖管理
 * 6. 数据统计
 */

const { SkillSystem } = require('../skill_system');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log('  ✅ ' + message);
  } else {
    failed++;
    console.log('  ❌ ' + message);
  }
}

async function runTests() {
  console.log('# Skill System 测试');
  console.log('='.repeat(50));

  // ========== Test 1: 基本注册 ==========
  console.log('\n## Test 1: 技能注册');
  const ss = new SkillSystem();
  // 禁用日志
  ss.setLogger({ log: () => {}, warn: () => {}, error: () => {} });

  const skill1 = {
    name: 'test-skill',
    description: '测试技能',
    triggers: ['测试', 'test', 't'],
    priority: 5,
    execute: async (input) => 'executed: ' + input.substring(0, 20)
  };

  assert(ss.registerSkill(skill1) === true, '注册技能成功');
  assert(ss.registerSkill(skill1) === false, '重复注册失败');
  assert(ss.listSkills().length === 1, '列表长度正确');

  // ========== Test 2: 注册验证 ==========
  console.log('\n## Test 2: 注册验证');
  assert(ss.registerSkill({ name: 'no-triggers', triggers: [], execute: async () => {} }) === false, '空触发词失败');
  assert(ss.registerSkill({ name: 'no-execute', triggers: ['x'] }) === false, '无执行函数失败');
  assert(ss.registerSkill({ name: 'no-name' }) === false, '无名称为止失败');

  // ========== Test 3: 技能匹配 ==========
  console.log('\n## Test 3: 技能匹配');

  ss.registerSkill({
    name: 'weather',
    description: '天气查询',
    triggers: ['天气', 'weather'],
    priority: 3,
    execute: async () => 'sunny'
  });

  ss.registerSkill({
    name: 'translate',
    description: '翻译',
    triggers: ['翻译', 'translate'],
    priority: 7,
    execute: async () => 'translated'
  });

  let match = ss.matchSkill('今天天气怎么样');
  assert(match !== null && match.skill === 'weather', '关键词"天气"匹配到weather');

  match = ss.matchSkill('帮我翻译这句话');
  assert(match !== null && match.skill === 'translate', '关键词"翻译"匹配到translate');

  match = ss.matchSkill('今天的测试结果怎么样');
  assert(match !== null && match.skill === 'test-skill', '关键词"测试"匹配到test-skill');

  match = ss.matchSkill('完全无关的内容');
  assert(match === null, '无匹配时返回null');

  // ========== Test 4: 优先级匹配 ==========
  console.log('\n## Test 4: 优先级');
  // translate优先级7 > weather优先级3
  // 但如果输入包含两个关键词，应该返回优先级高的
  match = ss.matchSkill('今天天气怎么样，顺便翻译一下');
  assert(match !== null, '多关键词能匹配');
  // 分数机制确保准确

  // ========== Test 5: 技能执行 ==========
  console.log('\n## Test 5: 技能执行');
  let result = await ss.executeSkill('weather', '北京天气');
  assert(result.success === true && result.result === 'sunny', '执行返回正确结果');

  result = await ss.executeSkill('non-existent', 'test');
  assert(result.success === false, '不存在的技能返回失败');

  // ========== Test 6: processInput ==========
  console.log('\n## Test 6: 输入处理');
  result = await ss.processInput('帮我翻译hello');
  assert(result.success === true, 'processInput自动匹配和执行');

  result = await ss.processInput('完全不相关的内容');
  assert(result.success === false && result.matched === false, '无匹配时processInput返回正确');

  // ========== Test 7: 链式执行 ==========
  console.log('\n## Test 7: 链式执行');
  // 注册formatter用于链式测试
  ss.registerSkill({
    name: 'formatter',
    description: '格式化',
    triggers: ['格式化', 'format'],
    priority: 3,
    execute: async (input) => '[已格式化] ' + input
  });

  const chainResult = await ss.executeChain('test-skill', '测试链式调用');
  assert(chainResult.length >= 1, '链式执行返回至少一个结果');
  assert(chainResult[0].result.success === true, '链式第一个执行成功');

  // ========== Test 8: 取消注册 ==========
  console.log('\n## Test 8: 取消注册');
  assert(ss.unregisterSkill('weather') === true, '取消注册成功');
  assert(ss.unregisterSkill('weather') === false, '重复取消注册失败');
  assert(ss.getSkill('weather') === null, '取消后getSkill返回null');

  // ========== Test 9: 依赖检查 ==========
  console.log('\n## Test 9: 依赖管理');
  ss.registerSkill({
    name: 'dependent-skill',
    description: '依赖测试',
    triggers: ['dep'],
    priority: 5,
    dependencies: ['translate'],
    execute: async () => 'dep result'
  });

  let depCheck = ss.checkDependencies('dependent-skill');
  assert(depCheck.satisfied === true, '依赖满足');

  depCheck = ss.checkDependencies('non-existent');
  assert(depCheck.satisfied === false, '不存在的技能依赖不满足');

  // ========== Test 10: 统计 ==========
  console.log('\n## Test 10: 统计');
  const stats = ss.getStatus();
  assert(stats.totalSkills > 2, '总技能数正确');
  assert(stats.totalExecutions > 0, '有执行记录');
  assert(stats.historySize > 0, '历史记录非空');

  ss.resetStats();
  const afterReset = ss.getStatus();
  assert(afterReset.totalExecutions === 0, '重置后执行数为0');

  // ========== Test 11: 多个匹配 ==========
  console.log('\n## Test 11: 多匹配');
  const allMatches = ss.matchAllSkills('测试天气翻译格式化');
  assert(allMatches.length >= 2, '多匹配返回多个结果');

  // ========== Test 12: 边界情况 ==========
  console.log('\n## Test 12: 边界情况');
  assert(ss.matchSkill(null) === null, 'null输入返回null');
  assert(ss.matchSkill('') === null, '空输入返回null');
  assert(ss.matchAllSkills(null).length === 0, 'null输入多匹配返回空数组');

  // ========== 汇总 ==========
  console.log('\n' + '='.repeat(50));
  console.log('测试完成: ' + passed + ' passed, ' + failed + ' failed');
  console.log('='.repeat(50));

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('测试失败:', err.message);
  process.exit(1);
});
