/**
 * 信息提取原理演示
 * 
 * 展示正则表达式如何从用户消息中提取信息
 */

console.log('🔍 信息提取原理演示\n');

// ============ 正则表达式基础 ============
console.log('📚 第一部分：正则表达式基础');
console.log('─'.repeat(50));

// 示例1：最简单的匹配
const text1 = "我叫张三";
const regex1 = /我叫(.+)/;
const match1 = text1.match(regex1);

console.log(`输入文本: "${text1}"`);
console.log(`正则表达式: /我叫(.+)/`);
console.log(`匹配结果:`, match1);
console.log(`提取的内容: ${match1[1]}`);
console.log();

// 示例2：添加结束条件
const text2 = "我叫张三。";
const regex2 = /我叫(.+?)(?:。|$)/;
const match2 = text2.match(regex2);

console.log(`输入文本: "${text2}"`);
console.log(`正则表达式: /我叫(.+?)(?:。|$)/`);
console.log(`匹配结果:`, match2);
console.log(`提取的内容: "${match2[1]}"`);
console.log();

// ============ 各种模式匹配 ============
console.log('\n📚 第二部分：各种模式匹配');
console.log('─'.repeat(50));

const patterns = [
    { regex: /我叫(.+?)(?:。|$)/i, key: 'name', desc: '提取名字' },
    { regex: /我是(.+?)(?:。|$)/i, key: 'name', desc: '提取名字' },
    { regex: /我的名字是(.+?)(?:。|$)/i, key: 'name', desc: '提取名字' },
    { regex: /我喜欢(.+?)(?:。|$)/i, key: 'preference', desc: '提取偏好' },
    { regex: /我想要(.+?)(?:。|$)/i, key: 'preference', desc: '提取偏好' },
    { regex: /我今年(\d+)岁/i, key: 'age', desc: '提取年龄' },
    { regex: /我住在(.+?)(?:。|$)/i, key: 'location', desc: '提取地址' }
];

const testMessages = [
    "我叫张三。",
    "我是李四",
    "我的名字是王五。",
    "我喜欢Python编程。",
    "我喜欢打篮球",
    "我想要学习人工智能。",
    "我今年25岁",
    "我住在北京。"
];

testMessages.forEach(message => {
    console.log(`\n输入: "${message}"`);
    
    for (const pattern of patterns) {
        const match = message.match(pattern.regex);
        if (match) {
            console.log(`  ✅ ${pattern.desc}: ${match[1]}`);
            console.log(`     使用正则: ${pattern.regex}`);
            break;  // 找到一个匹配就停止
        }
    }
});

// ============ 正则表达式详解 ============
console.log('\n\n📚 第三部分：正则表达式详解');
console.log('─'.repeat(50));

console.log(`
正则表达式：/我叫(.+?)(?:。|$)/i

分解说明：
┌─────────────────────────────────────────────────────┐
│ 我叫        → 匹配固定文字"我叫"                     │
│ (.+?)       → 捕获组，匹配任意字符（非贪婪模式）      │
│   │                                                    │
│   │         .  = 任意字符                              │
│   │         +  = 一个或多个                            │
│   │         ?  = 非贪婪模式（尽量少匹配）              │
│   │                                                    │
│ (?:。|$)    → 非捕获组，匹配句号或字符串结尾          │
│   │                                                    │
│   │         。  = 句号                                 │
│   │         |   = 或                                   │
│   │         $   = 字符串结尾                           │
│   │                                                    │
│ /i          → 修饰符，忽略大小写                       │
└─────────────────────────────────────────────────────┘

匹配过程示例：
"我叫张三。"
  │   │  │  │
  │   │  │  └── 匹配"。"，结束
  │   │  └───── 被(.+?)捕获为"张三"
  │   └──────── 匹配"我叫"
  └──────────── 开始匹配
`);

// ============ 非贪婪模式 vs 贪婪模式 ============
console.log('📚 第四部分：非贪婪模式 vs 贪婪模式');
console.log('─'.repeat(50));

const text3 = "我喜欢张三和李四。";

// 贪婪模式（.*）
const greedy = text3.match(/我喜欢(.*)和/);
console.log(`贪婪模式: /我喜欢(.*)和/`);
console.log(`  输入: "${text3}"`);
console.log(`  结果: "${greedy[1]}"`);
console.log(`  说明: .* 会匹配尽可能多的字符`);
console.log();

// 非贪婪模式（.*?）
const lazy = text3.match(/我喜欢(.*?)和/);
console.log(`非贪婪模式: /我喜欢(.*?)和/`);
console.log(`  输入: "${text3}"`);
console.log(`  结果: "${lazy[1]}"`);
console.log(`  说明: .*? 会匹配尽可能少的字符`);

// ============ 实际应用 ============
console.log('\n\n📚 第五部分：实际应用演示');
console.log('─'.repeat(50));

function extractInfo(message) {
    const patterns = [
        { regex: /我叫(.+?)(?:。|$)/i, key: 'name' },
        { regex: /我喜欢(.+?)(?:。|$)/i, key: 'preference' },
        { regex: /我今年(\d+)岁/i, key: 'age' },
        { regex: /我住在(.+?)(?:。|$)/i, key: 'location' }
    ];
    
    const extracted = {};
    
    for (const pattern of patterns) {
        const match = message.match(pattern.regex);
        if (match) {
            extracted[pattern.key] = match[1].trim();
        }
    }
    
    return extracted;
}

// 测试多条消息
const messages = [
    "我叫张三。我喜欢Python编程。",
    "我今年25岁，住在北京。",
    "我是李四，我喜欢打篮球"
];

messages.forEach((msg, i) => {
    console.log(`\n消息${i + 1}: "${msg}"`);
    const info = extractInfo(msg);
    console.log(`提取结果:`, info);
});

console.log('\n🎉 演示完成！');
