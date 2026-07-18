/**
 * Memory系统测试脚本
 * 
 * 测试内容：
 * 1. 短期记忆的添加和查询
 * 2. 长期记忆的持久化存储
 * 3. 从对话中学习用户信息
 */

const { ShortTermMemory, LongTermMemory, MemoryManager } = require('../memory');

console.log('🧪 测试Memory系统\n');

// ============ 测试1：短期记忆 ============
console.log('📋 测试1：短期记忆功能');
console.log('─'.repeat(40));

const shortTerm = new ShortTermMemory(5);  // 最多保存5条

// 添加消息
shortTerm.addMessage('user', '我叫张三');
shortTerm.addMessage('assistant', '你好张三！有什么可以帮助你的？');
shortTerm.addMessage('user', '今天天气怎么样？');
shortTerm.addMessage('assistant', '今天天气晴朗，适合出门。');
shortTerm.addMessage('user', '谢谢');

console.log(`  消息数量: ${shortTerm.size()} 条`);
console.log(`  所有消息:`);
shortTerm.getContext().forEach((msg, i) => {
    console.log(`    ${i+1}. [${msg.role}] ${msg.content}`);
});

// 测试超出容量
console.log('\n  添加第6条消息（超过容量5）...');
shortTerm.addMessage('assistant', '不客气！');
console.log(`  消息数量: ${shortTerm.size()} 条（应该还是5）`);

// 测试搜索
console.log('\n  搜索包含"张三"的消息:');
const results = shortTerm.search('张三');
results.forEach(msg => {
    console.log(`    - [${msg.role}] ${msg.content}`);
});

console.log('✅ 短期记忆测试完成\n');

// ============ 测试2：长期记忆 ============
console.log('📋 测试2：长期记忆功能');
console.log('─'.repeat(40));

const longTerm = new LongTermMemory('./test_memory.json');

// 保存用户偏好
longTerm.remember('name', '张三');
longTerm.remember('language', 'zh');
longTerm.remember('theme', 'dark');

console.log(`  记住用户名字: ${longTerm.recall('name')}`);
console.log(`  记住语言偏好: ${longTerm.recall('language')}`);
console.log(`  记住主题偏好: ${longTerm.recall('theme')}`);

// 学习新知识
longTerm.learn('Node.js', 'Node.js是一个基于Chrome V8引擎的JavaScript运行时');
longTerm.learn('Git', 'Git是一个分布式版本控制系统');

console.log(`\n  学到的知识:`);
longTerm.memory.learnedKnowledge.forEach(item => {
    console.log(`    - ${item.topic}: ${item.knowledge.substring(0, 30)}...`);
});

console.log('✅ 长期记忆测试完成\n');

// ============ 测试3：Memory管理器 ============
console.log('📋 测试3：Memory管理器');
console.log('─'.repeat(40));

const memory = new MemoryManager('./test_memory.json');

// 模拟对话
memory.addUserMessage('我叫李四');
memory.addAssistantMessage('你好李四！很高兴认识你！');
memory.addUserMessage('我喜欢编程');
memory.addAssistantMessage('编程很有趣！你想学什么语言？');

// 自动学习用户信息
memory.learnFromMessage('我叫李四');
memory.learnFromMessage('我喜欢Python');

console.log(`\n  自动学习到的信息:`);
console.log(`    用户名字: ${memory.longTerm.recall('name')}`);
console.log(`    用户偏好: ${memory.longTerm.recall('preference')}`);

// 显示状态
memory.showStatus();

console.log('✅ Memory管理器测试完成\n');

// ============ 测试4：持久化 ============
console.log('📋 测试4：持久化存储');
console.log('─'.repeat(40));

// 重新加载，验证数据是否保存
const memory2 = new MemoryManager('./test_memory.json');
console.log(`  重新加载后，用户名: ${memory2.longTerm.recall('name')}`);
console.log(`  重新加载后，学到知识数量: ${memory2.longTerm.memory.learnedKnowledge.length}`);

console.log('✅ 持久化测试完成\n');

// 清理测试文件
const fs = require('fs');
if (fs.existsSync('./test_memory.json')) {
    fs.unlinkSync('./test_memory.json');
    console.log('🧹 测试文件已清理');
}

console.log('🎉 所有测试通过！');

