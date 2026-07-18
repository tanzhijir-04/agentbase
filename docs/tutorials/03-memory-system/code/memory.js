/**
 * Memory系统 - 让Agent具备记忆能力
 * 
 * 原理讲解：
 * ================
 * 
 * 【为什么需要Memory？】
 * 
 * 没有Memory的Agent：
 *   用户：我叫张三
 *   Agent：你好张三！
 *   （下次对话）
 *   用户：我叫什么？
 *   Agent：我不知道你是谁 ❌
 * 
 * 有Memory的Agent：
 *   用户：我叫张三
 *   Agent：你好张三！（记住：user_name = 张三）
 *   （下次对话）
 *   用户：我叫什么？
 *   Agent：你叫张三！ ✅
 * 
 * 
 * 【Memory的两种类型】
 * 
 * 1. 短期记忆（Short-term Memory）
 *    - 存储位置：内存（数组）
 *    - 生命周期：会话结束就丢失
 *    - 用途：当前对话上下文
 *    - 数据结构：消息数组
 *    - 例子：记住刚才说过的话
 * 
 * 2. 长期记忆（Long-term Memory）
 *    - 存储位置：文件（JSON）
 *    - 生命周期：永久保存
 *    - 用途：用户偏好、知识
 *    - 数据结构：键值对对象
 *    - 例子：记住用户的名字、偏好
 * 
 * 
 * 【数据结构设计】
 * 
 * 短期记忆（消息数组）：
 * [
 *   { role: 'user', content: '我叫张三', timestamp: 1234567890 },
 *   { role: 'assistant', content: '你好张三！', timestamp: 1234567891 },
 *   { role: 'user', content: '今天天气怎么样？', timestamp: 1234567892 }
 * ]
 * 
 * 长期记忆（键值对）：
 * {
 *   "userPreferences": {
 *     "name": "张三",
 *     "language": "zh",
 *     "theme": "dark"
 *   },
 *   "learnedKnowledge": [
 *     { key: "项目名", value: "AI-Agent-Study" }
 *   ],
 *   "projectInfo": {
 *     "created": "2026-07-10",
 *     "description": "AI Agent学习项目"
 *   }
 * }
 * 
 * 
 * 【核心算法】
 * 
 * 1. 短期记忆管理：
 *    - 添加消息时检查是否超过最大容量
 *    - 超过时删除最旧的消息（FIFO队列）
 *    - 保持最近N条消息用于上下文
 * 
 * 2. 长期记忆管理：
 *    - 读取时从文件加载
 *    - 写入时保存到文件
 *    - 使用JSON格式便于读写
 * 
 * 3. 记忆检索：
 *    - 关键词匹配
 *    - 时间范围查询
 *    - 模糊搜索
 */

const fs = require('fs');
const path = require('path');

/**
 * 短期记忆类
 * 管理当前会话的对话历史
 */
class ShortTermMemory {
    /**
     * @param {number} maxMessages - 最大保存消息数量
     */
    constructor(maxMessages = 50) {
        this.messages = [];           // 消息存储数组
        this.maxMessages = maxMessages; // 最大容量
    }
    
    /**
     * 添加消息到短期记忆
     * 
     * 原理：使用数组存储消息，当超过最大容量时
     *       删除最旧的消息（FIFO - 先进先出）
     * 
     * @param {string} role - 角色：'user' 或 'assistant'
     * @param {string} content - 消息内容
     */
    addMessage(role, content) {
        const message = {
            role: role,
            content: content,
            timestamp: Date.now()  // 记录时间戳，用于排序和查询
        };
        
        this.messages.push(message);
        
        // 检查是否超过最大容量
        if (this.messages.length > this.maxMessages) {
            // 删除最旧的消息（第一个元素）
            this.messages.shift();
            console.log(`[短期记忆] 已达到最大容量，删除最旧的消息`);
        }
    }
    
    /**
     * 获取所有消息
     * @returns {Array} 消息数组
     */
    getContext() {
        return this.messages;
    }
    
    /**
     * 获取最近N条消息
     * @param {number} n - 获取最近几条
     * @returns {Array} 最近的消息
     */
    getRecentMessages(n = 10) {
        return this.messages.slice(-n);
    }
    
    /**
     * 搜索消息（简单关键词匹配）
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 匹配的消息
     */
    search(keyword) {
        return this.messages.filter(msg => 
            msg.content.toLowerCase().includes(keyword.toLowerCase())
        );
    }
    
    /**
     * 清空短期记忆
     */
    clear() {
        this.messages = [];
        console.log(`[短期记忆] 已清空`);
    }
    
    /**
     * 获取消息数量
     * @returns {number} 消息数量
     */
    size() {
        return this.messages.length;
    }
}

/**
 * 长期记忆类
 * 管理跨会话的持久化记忆
 */
class LongTermMemory {
    /**
     * @param {string} storagePath - 存储文件路径
     */
    constructor(storagePath = null) {
        // 默认存储到 memory.json
        this.storagePath = storagePath || path.join(__dirname, 'memory.json');
        
        // 记忆数据结构
        this.memory = {
            userPreferences: {},      // 用户偏好
            learnedKnowledge: [],     // 学习到的知识
            projectInfo: {},          // 项目信息
            conversationSummaries: [] // 对话摘要
        };
        
        // 从文件加载已有记忆
        this.load();
    }
    
    /**
     * 从文件加载记忆
     * 
     * 原理：程序启动时从memory.json读取之前保存的记忆
     *       如果文件不存在，使用默认空结构
     */
    load() {
        try {
            if (fs.existsSync(this.storagePath)) {
                const data = fs.readFileSync(this.storagePath, 'utf-8');
                this.memory = JSON.parse(data);
                console.log(`[长期记忆] 从文件加载记忆成功`);
            } else {
                console.log(`[长期记忆] 首次运行，创建新记忆`);
            }
        } catch (error) {
            console.log(`[长期记忆] 加载失败，使用默认记忆: ${error.message}`);
        }
    }
    
    /**
     * 保存记忆到文件
     * 
     * 原理：将内存中的记忆对象序列化为JSON字符串
     *       写入到memory.json文件
     */
    save() {
        try {
            fs.writeFileSync(this.storagePath, JSON.stringify(this.memory, null, 2), 'utf-8');
            console.log(`[长期记忆] 记忆已保存到文件`);
        } catch (error) {
            console.log(`[长期记忆] 保存失败: ${error.message}`);
        }
    }
    
    /**
     * 记住用户偏好
     * 
     * 原理：使用键值对存储，key是属性名，value是属性值
     *       例如：remember('name', '张三')
     * 
     * @param {string} key - 键
     * @param {*} value - 值
     */
    remember(key, value) {
        this.memory.userPreferences[key] = value;
        this.save();  // 每次修改都保存
        console.log(`[长期记忆] 记住: ${key} = ${value}`);
    }
    
    /**
     * 回忆用户偏好
     * 
     * @param {string} key - 键
     * @returns {*} 值，不存在则返回undefined
     */
    recall(key) {
        return this.memory.userPreferences[key];
    }
    
    /**
     * 添加学到的知识
     * 
     * @param {string} topic - 主题
     * @param {string} knowledge - 知识内容
     */
    learn(topic, knowledge) {
        this.memory.learnedKnowledge.push({
            topic: topic,
            knowledge: knowledge,
            learnedAt: Date.now()
        });
        this.save();
        console.log(`[长期记忆] 学习新知识: ${topic}`);
    }
    
    /**
     * 搜索知识
     * 
     * @param {string} keyword - 关键词
     * @returns {Array} 匹配的知识
     */
    searchKnowledge(keyword) {
        return this.memory.learnedKnowledge.filter(item =>
            item.topic.toLowerCase().includes(keyword.toLowerCase()) ||
            item.knowledge.toLowerCase().includes(keyword.toLowerCase())
        );
    }
    
    /**
     * 保存对话摘要
     * 
     * 原理：将长对话压缩成摘要，节省存储空间
     *       保留关键信息，丢弃细节
     * 
     * @param {string} summary - 摘要内容
     * @param {number} messageCount - 原始消息数量
     */
    saveSummary(summary, messageCount) {
        this.memory.conversationSummaries.push({
            summary: summary,
            messageCount: messageCount,
            createdAt: Date.now()
        });
        this.save();
    }
    
    /**
     * 获取所有记忆
     * @returns {Object} 记忆对象
     */
    getAll() {
        return this.memory;
    }
    
    /**
     * 清空所有记忆
     */
    clearAll() {
        this.memory = {
            userPreferences: {},
            learnedKnowledge: [],
            projectInfo: {},
            conversationSummaries: []
        };
        this.save();
        console.log(`[长期记忆] 已清空所有记忆`);
    }
}

/**
 * Memory管理器
 * 整合短期记忆和长期记忆
 */
class MemoryManager {
    constructor(storagePath = null) {
        this.shortTerm = new ShortTermMemory(50);  // 最多保存50条
        this.longTerm = new LongTermMemory(storagePath);
        
        console.log(`[Memory] 初始化完成`);
    }
    
    /**
     * 添加用户消息
     * 同时更新短期记忆
     */
    addUserMessage(content) {
        this.shortTerm.addMessage('user', content);
    }
    
    /**
     * 添加助手回复
     * 同时更新短期记忆
     */
    addAssistantMessage(content) {
        this.shortTerm.addMessage('assistant', content);
    }
    
    /**
     * 从对话中学习用户信息
     * 
     * 原理：分析用户消息，提取关键信息
     *       例如：用户说"我叫张三"，提取 name = 张三
     */
    learnFromMessage(message) {
        // 简单的信息提取规则
        const patterns = [
            { regex: /我叫(.+?)(?:。|$)/i, key: 'name' },
            { regex: /我是(.+?)(?:。|$)/i, key: 'name' },
            { regex: /我的名字是(.+?)(?:。|$)/i, key: 'name' },
            { regex: /我喜欢(.+?)(?:。|$)/i, key: 'preference' },
            { regex: /我想要(.+?)(?:。|$)/i, key: 'preference' }
        ];
        
        for (const pattern of patterns) {
            const match = message.match(pattern.regex);
            if (match) {
                this.longTerm.remember(pattern.key, match[1].trim());
                return true;
            }
        }
        return false;
    }
    
    /**
     * 获取对话上下文（用于发送给LLM）
     * 
     * 原理：将短期记忆格式化为LLM可以理解的消息格式
     */
    getConversationContext() {
        const messages = this.shortTerm.getContext();
        
        // 添加系统消息（可选）
        const context = [
            { role: 'system', content: '你是一个有帮助的AI助手。' },
            ...messages.map(m => ({ role: m.role, content: m.content }))
        ];
        
        return context;
    }
    
    /**
     * 搜索所有记忆
     * 
     * @param {string} keyword - 关键词
     * @returns {Object} 搜索结果
     */
    search(keyword) {
        return {
            shortTerm: this.shortTerm.search(keyword),
            knowledge: this.longTerm.searchKnowledge(keyword),
            preference: this.longTerm.recall(keyword)
        };
    }
    
    /**
     * 显示记忆状态
     */
    showStatus() {
        console.log(`\n📊 Memory状态:`);
        console.log(`  短期记忆: ${this.shortTerm.size()} 条消息`);
        console.log(`  长期记忆:`);
        console.log(`    - 用户偏好: ${Object.keys(this.longTerm.memory.userPreferences).length} 项`);
        console.log(`    - 学到知识: ${this.longTerm.memory.learnedKnowledge.length} 条`);
        console.log(`    - 对话摘要: ${this.longTerm.memory.conversationSummaries.length} 条`);
    }
}

// 导出模块
module.exports = { ShortTermMemory, LongTermMemory, MemoryManager };
