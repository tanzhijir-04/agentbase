#!/usr/bin/env node

/**
 * Context Compression - 五种压缩技术演示
 * 
 * 学习目标：
 * 1. 理解五种主要的上下文压缩技术
 * 2. 掌握每种技术的实现原理和适用场景
 * 3. 学会根据实际需求选择合适的压缩策略
 */

// ============================================================
// 技术1: 滑动窗口（Sliding Window）
// ============================================================
class SlidingWindowCompressor {
    constructor(maxSize = 10) {
        this.maxSize = maxSize;
        this.window = [];
        this.name = 'SlidingWindow';
    }

    addMessage(message) {
        this.window.push(message);
        if (this.window.length > this.maxSize) {
            return this.window.shift();
        }
        return null;
    }

    getContext() {
        return [...this.window];
    }

    getStats() {
        return {
            name: this.name,
            currentSize: this.window.length,
            maxSize: this.maxSize
        };
    }
}

// ============================================================
// 技术2: 重要性评分（Importance Scoring）
// ============================================================
class ImportanceScorer {
    constructor(options = {}) {
        this.keywords = options.keywords || ['重要', '关键', '决定', '必须', '紧急', '问题', '错误', '修复'];
        this.minScore = options.minScore || 3;
        this.name = 'ImportanceScorer';
    }

    scoreMessage(message) {
        let score = 0;
        const content = message.content || '';

        const len = content.length;
        if (len > 20 && len < 500) score += 2;
        else if (len > 500) score += 1;

        for (const keyword of this.keywords) {
            if (content.includes(keyword)) {
                score += 2;
            }
        }

        if (message.role === 'user') score += 1;
        if (message.role === 'assistant' && content.length > 100) score += 1;

        if (content.includes('function') || content.includes('class')) {
            score += 2;
        }

        return score;
    }

    compress(messages) {
        return messages
            .map(msg => ({ ...msg, score: this.scoreMessage(msg) }))
            .filter(msg => msg.score >= this.minScore)
            .sort((a, b) => b.score - a.score);
    }

    getStats() {
        return {
            name: this.name,
            keywordsCount: this.keywords.length,
            minScore: this.minScore
        };
    }
}

// ============================================================
// 技术3: 分层存储（Hierarchical Storage）
// ============================================================
class HierarchicalStorage {
    constructor(options = {}) {
        this.tiers = { hot: [], warm: [], cold: [] };
        this.limits = {
            hot: options.hotLimit || 10,
            warm: options.warmLimit || 20,
            cold: options.coldLimit || 50
        };
        this.name = 'HierarchicalStorage';
    }

    addMessage(message, importance = 5) {
        if (importance >= 8) {
            this._addToTier('hot', message);
        } else if (importance >= 4) {
            this._addToTier('warm', message);
        } else {
            this._addToTier('cold', message);
        }
    }

    _addToTier(tier, message) {
        this.tiers[tier].push(message);
        while (this.tiers[tier].length > this.limits[tier]) {
            this.tiers[tier].shift();
        }
    }

    getContext() {
        return [
            ...this.tiers.hot,
            ...this.tiers.warm.slice(-3),
            ...this.tiers.cold.slice(-1)
        ];
    }

    getStats() {
        return {
            name: this.name,
            hotCount: this.tiers.hot.length,
            warmCount: this.tiers.warm.length,
            coldCount: this.tiers.cold.length,
            totalMessages: this.tiers.hot.length + this.tiers.warm.length + this.tiers.cold.length,
            contextSize: this.getContext().length
        };
    }
}

// ============================================================
// 技术4: 摘要压缩（Summary Compression）
// ============================================================
class SummaryCompressor {
    constructor() {
        this.name = 'SummaryCompressor';
    }

    compress(messages) {
        if (messages.length <= 5) return messages;

        const recent = messages.slice(-3);
        const early = messages.slice(0, -3);
        const summary = this._generateSummary(early);

        return [
            { role: 'system', content: summary, type: 'summary' },
            ...recent
        ];
    }

    _generateSummary(messages) {
        const keyPoints = [];
        for (const msg of messages) {
            const content = msg.content || '';
            if (content.length > 10) {
                const preview = content.substring(0, 50);
                keyPoints.push('[' + msg.role + ']: ' + preview + '...');
            }
        }

        return '对话摘要（共' + messages.length + '条消息）:\n' +
               keyPoints.slice(0, 5).join('\n') +
               (keyPoints.length > 5 ? '\n... 等共' + keyPoints.length + '条' : '');
    }

    getStats() {
        return { name: this.name };
    }
}

// ============================================================
// 技术5: 混合压缩器（Hybrid Compressor）
// ============================================================
class HybridCompressor {
    constructor(options = {}) {
        this.windowSize = options.windowSize || 10;
        this.slidingWindow = new SlidingWindowCompressor(this.windowSize);
        this.importanceScorer = new ImportanceScorer(options.scoring);
        this.name = 'HybridCompressor';
    }

    addMessage(message) {
        this.slidingWindow.addMessage(message);

        if (this.slidingWindow.window.length >= this.windowSize) {
            this._smartCompress();
        }

        return null;
    }

    _smartCompress() {
        const current = this.slidingWindow.getContext();
        if (current.length <= 5) return;

        const scored = current.map(msg => ({
            ...msg,
            score: this.importanceScorer.scoreMessage(msg)
        }));

        const important = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, Math.floor(this.windowSize * 0.6));

        const recent = scored.slice(-4);

        const merged = [...important, ...recent];
        const unique = [];
        const seen = new Set();
        for (const msg of merged) {
            const key = msg.content.substring(0, 20);
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(msg);
            }
        }

        this.slidingWindow.window = unique.slice(0, this.windowSize);
    }

    getContext() {
        return this.slidingWindow.getContext();
    }

    getStats() {
        return {
            name: this.name,
            windowSize: this.windowSize,
            ...this.slidingWindow.getStats()
        };
    }
}

// ============================================================
// 演示和测试
// ============================================================
function generateTestMessages(count = 25) {
    const messages = [];
    const templates = [
        { role: 'user', content: '请帮我分析这段代码的问题' },
        { role: 'assistant', content: '好的，我来分析一下。这段代码存在以下问题：1. 内存泄漏风险 2. 性能瓶颈' },
        { role: 'user', content: '能给出修复建议吗？' },
        { role: 'assistant', content: '建议使用以下方式修复：优化数据结构，减少不必要的计算' },
        { role: 'user', content: '这个功能很重要，必须在今天完成' },
        { role: 'assistant', content: '明白，这是一个关键任务。我会优先处理这个问题。' },
        { role: 'user', content: '测试一下修改后的效果' },
        { role: 'assistant', content: '测试结果：性能提升了50%，内存使用降低了30%。问题已成功修复。' },
        { role: 'user', content: '还有其他需要注意的地方吗？' },
        { role: 'assistant', content: '建议添加错误处理和日志记录，这样可以更好地追踪潜在问题。' },
    ];

    for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];
        messages.push({
            ...template,
            content: template.content + (i > templates.length ? ' [第' + (i + 1) + '轮]' : ''),
            timestamp: Date.now() + i * 1000
        });
    }

    return messages;
}

function runDemo() {
    console.log('='.repeat(60));
    console.log('  Context Compression - 五种技术演示');
    console.log('='.repeat(60));
    console.log();

    const messages = generateTestMessages(25);
    console.log('测试数据：生成 ' + messages.length + ' 条模拟对话消息\n');

    // 测试1: 滑动窗口
    console.log('-'.repeat(60));
    console.log('技术1: 滑动窗口（Sliding Window）');
    console.log('-'.repeat(60));
    const sliding = new SlidingWindowCompressor(10);
    messages.forEach(msg => sliding.addMessage(msg));
    console.log('输入: ' + messages.length + ' 条消息');
    console.log('输出: ' + sliding.getContext().length + ' 条消息');
    console.log('保留率: ' + ((sliding.getContext().length / messages.length) * 100).toFixed(1) + '%');
    console.log('统计: ' + JSON.stringify(sliding.getStats()));
    console.log();

    // 测试2: 重要性评分
    console.log('-'.repeat(60));
    console.log('技术2: 重要性评分（Importance Scoring）');
    console.log('-'.repeat(60));
    const scorer = new ImportanceScorer({ minScore: 4 });
    const scored = scorer.compress(messages);
    console.log('输入: ' + messages.length + ' 条消息');
    console.log('输出: ' + scored.length + ' 条消息（按重要性排序）');
    console.log('保留率: ' + ((scored.length / messages.length) * 100).toFixed(1) + '%');
    console.log('Top 3 重要消息:');
    scored.slice(0, 3).forEach((msg, i) => {
        console.log('  ' + (i + 1) + '. [' + msg.role + '] 评分:' + msg.score + ' - ' + msg.content.substring(0, 40) + '...');
    });
    console.log();

    // 测试3: 分层存储
    console.log('-'.repeat(60));
    console.log('技术3: 分层存储（Hierarchical Storage）');
    console.log('-'.repeat(60));
    const hierarchical = new HierarchicalStorage();
    messages.forEach((msg, i) => {
        const importance = i < 5 ? 9 : (i < 15 ? 5 : 2);
        hierarchical.addMessage(msg, importance);
    });
    console.log('输入: ' + messages.length + ' 条消息');
    console.log('分层存储: ' + JSON.stringify(hierarchical.getStats()));
    console.log('输出: ' + hierarchical.getContext().length + ' 条消息（合并后）');
    console.log();

    // 测试4: 摘要压缩
    console.log('-'.repeat(60));
    console.log('技术4: 摘要压缩（Summary Compression）');
    console.log('-'.repeat(60));
    const summarizer = new SummaryCompressor();
    const summarized = summarizer.compress(messages);
    console.log('输入: ' + messages.length + ' 条消息');
    console.log('输出: ' + summarized.length + ' 条消息');
    console.log('摘要内容:');
    const summaryMsg = summarized.find(m => m.type === 'summary');
    if (summaryMsg) {
        console.log('  ' + summaryMsg.content.split('\n').join('\n  '));
    }
    console.log();

    // 测试5: 混合压缩
    console.log('-'.repeat(60));
    console.log('技术5: 混合压缩器（Hybrid Compressor）');
    console.log('-'.repeat(60));
    const hybrid = new HybridCompressor({ windowSize: 8 });
    messages.forEach(msg => hybrid.addMessage(msg));
    console.log('输入: ' + messages.length + ' 条消息');
    console.log('输出: ' + hybrid.getContext().length + ' 条消息');
    console.log('保留率: ' + ((hybrid.getContext().length / messages.length) * 100).toFixed(1) + '%');
    console.log('统计: ' + JSON.stringify(hybrid.getStats()));
    console.log();

    // 总结对比
    console.log('='.repeat(60));
    console.log('总结对比');
    console.log('='.repeat(60));
    console.log('');
    console.log('技术        | 输出 | 保留率 | 适用场景');
    console.log('------------|------|--------|----------');
    console.log('滑动窗口    | ' + String(sliding.getContext().length).padStart(3) + ' | ' + ((sliding.getContext().length / messages.length) * 100).toFixed(0).padStart(4) + '% | 实时对话');
    console.log('重要性评分  | ' + String(scored.length).padStart(3) + ' | ' + ((scored.length / messages.length) * 100).toFixed(0).padStart(4) + '% | 关键信息保留');
    console.log('分层存储    | ' + String(hierarchical.getContext().length).padStart(3) + ' | ' + ((hierarchical.getContext().length / messages.length) * 100).toFixed(0).padStart(4) + '% | 长期记忆管理');
    console.log('摘要压缩    | ' + String(summarized.length).padStart(3) + ' | ' + ((summarized.length / messages.length) * 100).toFixed(0).padStart(4) + '% | 大幅压缩');
    console.log('混合压缩    | ' + String(hybrid.getContext().length).padStart(3) + ' | ' + ((hybrid.getContext().length / messages.length) * 100).toFixed(0).padStart(4) + '% | 生产环境通用');
    console.log('');
    console.log('演示完成！');
    console.log('提示：实际应用中，摘要压缩应使用LLM进行智能摘要生成。');
}

runDemo();
