/**
 * Agent v2.0 功能测试
 * 测试Memory系统和语言识别功能
 */

const { MinimalCodingAgent, LanguageDetector } = require('../agent_v2');

console.log('🧪 Agent v2.0 功能测试\n');

// 创建Agent实例
const agent = new MinimalCodingAgent();

// ============ 测试1：Memory功能 ============
console.log('📋 测试1：Memory功能');
console.log('─'.repeat(40));

// 测试记住
console.log('\n1. 测试 remember 命令:');
console.log(agent.remember('name', '张三'));
console.log(agent.remember('language', '中文'));
console.log(agent.remember('hobby', '编程'));

// 测试回忆
console.log('\n2. 测试 recall 命令:');
console.log(agent.recall('name'));
console.log(agent.recall('language'));
console.log(agent.recall('hobby'));
console.log(agent.recall('nonexistent'));

// 测试显示所有记忆
console.log('\n3. 测试 memory 命令:');
console.log(agent.showMemory());

// ============ 测试2：自动学习 ============
console.log('\n\n📋 测试2：自动学习（从对话中提取信息）');
console.log('─'.repeat(40));

const testMessages = [
    '我叫李四。',
    '我喜欢Python编程。',
    '我今年25岁。',
    '我住在北京。',
    'Hello, how are you?'
];

testMessages.forEach(msg => {
    console.log(`\n用户说: "${msg}"`);
    const extracted = agent.learnFromUserMessage(msg);
    
    if (extracted.length > 0) {
        console.log('  自动提取:');
        extracted.forEach(item => {
            console.log(`    - ${item.desc}: ${item.value}`);
        });
    } else {
        console.log('  (未提取到个人信息)');
    }
});

// 显示更新后的记忆
console.log('\n更新后的记忆:');
console.log(agent.showMemory());

// ============ 测试3：语言识别 ============
console.log('\n\n📋 测试3：语言识别');
console.log('─'.repeat(40));

// 自然语言检测
console.log('\n1. 自然语言检测:');
const naturalTests = [
    'Hello, how are you?',
    '你好，世界！',
    '我叫张三，I am a programmer.',
    '今天天气很好',
    'The quick brown fox'
];

naturalTests.forEach(text => {
    const result = agent.detectNaturalLanguage(text);
    const langName = result.lang === 'zh' ? '中文' : '英文';
    console.log(`  "${text.substring(0, 25)}${text.length > 25 ? '...' : ''}" → ${langName} (${result.confidence})`);
});

// 编程语言检测
console.log('\n2. 编程语言检测（文件扩展名）:');
const fileTests = [
    'agent.js', 'memory.py', 'app.tsx', 
    'style.css', 'README.md', 'config.json'
];

fileTests.forEach(file => {
    const lang = agent.detectFileLanguage(file);
    console.log(`  ${file} → ${lang}`);
});

// ============ 测试4：完整流程 ============
console.log('\n\n📋 测试4：完整流程模拟');
console.log('─'.repeat(40));

// 模拟对话流程
console.log('\n模拟对话流程:\n');

// 用户自我介绍
const userMsg1 = '你好，我叫王五，我喜欢学习AI。';
console.log(`👤 用户: ${userMsg1}`);

const extracted1 = agent.learnFromUserMessage(userMsg1);
console.log(`🤖 Agent: 我记住了！${extracted1.map(e => `${e.desc}=${e.value}`).join(', ')}`);

// 检测语言
const lang1 = agent.detectNaturalLanguage(userMsg1);
console.log(`   (检测到语言: ${lang1.lang === 'zh' ? '中文' : '英文'})`);

// 用户询问
const userMsg2 = '我叫什么名字？';
console.log(`\n👤 用户: ${userMsg2}`);

// Agent从记忆中回答
const name = agent.memory.longTerm.recall('name');
console.log(`🤖 Agent: 你叫${name}！`);

// 显示最终记忆状态
console.log('\n\n📊 最终Memory状态:');
console.log(agent.showMemory());

console.log('\n🎉 所有测试完成！');

