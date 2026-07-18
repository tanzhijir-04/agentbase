/**
 * Message Queue - 消息队列系统
 * 
 * 功能：
 * 1. Agent间消息传递
 * 2. 主题订阅和广播
 * 3. 消息优先级处理
 * 4. 消息持久化（可选）
 */

class MessageQueue {
  constructor() {
    this.queues = new Map(); // agentId -> queue
    this.subscribers = new Map(); // topic -> [agentId]
    this.messageHistory = []; // 消息历史
    this.maxHistorySize = 1000; // 最大历史记录数
  }

  // 创建队列
  createQueue(agentId) {
    if (!this.queues.has(agentId)) {
      this.queues.set(agentId, []);
      console.log(`Created queue for agent: ${agentId}`);
    }
  }

  // 发送消息
  send(message, targetAgentId) {
    if (!this.queues.has(targetAgentId)) {
      this.createQueue(targetAgentId);
    }
    
    const enrichedMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now(),
      delivered: false
    };
    
    this.queues.get(targetAgentId).push(enrichedMessage);
    
    // 记录到历史
    this.recordMessage(enrichedMessage);
    
    // 触发接收
    this.notifySubscriber(targetAgentId, enrichedMessage);
    
    return enrichedMessage.id;
  }

  // 广播消息
  broadcast(message, topic) {
    const subscribers = this.subscribers.get(topic) || [];
    console.log(`Broadcasting to ${subscribers.length} subscribers on topic: ${topic}`);
    
    subscribers.forEach(agentId => {
      this.send(message, agentId);
    });
    
    return subscribers.length;
  }

  // 订阅主题
  subscribe(agentId, topic) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    
    const subscribers = this.subscribers.get(topic);
    if (!subscribers.includes(agentId)) {
      subscribers.push(agentId);
      console.log(`Agent ${agentId} subscribed to topic: ${topic}`);
    }
  }

  // 取消订阅
  unsubscribe(agentId, topic) {
    if (this.subscribers.has(topic)) {
      const subscribers = this.subscribers.get(topic);
      const index = subscribers.indexOf(agentId);
      if (index > -1) {
        subscribers.splice(index, 1);
        console.log(`Agent ${agentId} unsubscribed from topic: ${topic}`);
      }
    }
  }

  // 获取消息
  receive(agentId) {
    const queue = this.queues.get(agentId);
    if (queue && queue.length > 0) {
      const message = queue.shift();
      message.delivered = true;
      return message;
    }
    return null;
  }

  // 查看消息（不取出）
  peek(agentId) {
    const queue = this.queues.get(agentId);
    if (queue && queue.length > 0) {
      return queue[0];
    }
    return null;
  }

  // 获取队列大小
  getQueueSize(agentId) {
    const queue = this.queues.get(agentId);
    return queue ? queue.length : 0;
  }

  // 清空队列
  clearQueue(agentId) {
    if (this.queues.has(agentId)) {
      this.queues.set(agentId, []);
      console.log(`Cleared queue for agent: ${agentId}`);
    }
  }

  // 通知订阅者
  notifySubscriber(agentId, message) {
    // 这里应该实现实际的回调通知
    console.log(`Notifying agent ${agentId} of new message: ${message.type}`);
  }

  // 记录消息
  recordMessage(message) {
    this.messageHistory.push(message);
    
    // 限制历史记录大小
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }
  }

  // 获取消息历史
  getMessageHistory(limit = 100) {
    return this.messageHistory.slice(-limit);
  }

  // 生成消息ID
  generateMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取系统状态
  getStatus() {
    const queueSizes = {};
    this.queues.forEach((queue, agentId) => {
      queueSizes[agentId] = queue.length;
    });

    return {
      totalAgents: this.queues.size,
      queueSizes: queueSizes,
      totalMessages: this.messageHistory.length,
      subscribers: Object.fromEntries(this.subscribers)
    };
  }
}

// 导出模块
module.exports = MessageQueue;

// 如果直接运行此文件，执行示例
if (require.main === module) {
  console.log('=== Message Queue Demo ===\n');
  
  const mq = new MessageQueue();
  
  // 创建队列
  mq.createQueue('agent1');
  mq.createQueue('agent2');
  mq.createQueue('agent3');
  
  // 订阅主题
  mq.subscribe('agent1', 'system_events');
  mq.subscribe('agent2', 'system_events');
  mq.subscribe('agent3', 'user_events');
  
  // 发送消息
  console.log('Sending messages...\n');
  
  mq.send({
    type: 'task',
    content: 'Process user data',
    priority: 'high'
  }, 'agent1');
  
  mq.send({
    type: 'notification',
    content: 'System update available',
    priority: 'medium'
  }, 'agent2');
  
  // 广播消息
  mq.broadcast({
    type: 'system_event',
    content: 'System startup complete',
    priority: 'low'
  }, 'system_events');
  
  // 显示状态
  console.log('\n=== Queue Status ===');
  console.log(JSON.stringify(mq.getStatus(), null, 2));
  
  // 接收消息
  console.log('\n=== Receiving Messages ===');
  
  let message = mq.receive('agent1');
  while (message) {
    console.log(`Agent1 received: ${JSON.stringify(message)}`);
    message = mq.receive('agent1');
  }
  
  message = mq.receive('agent2');
  while (message) {
    console.log(`Agent2 received: ${JSON.stringify(message)}`);
    message = mq.receive('agent2');
  }
  
  message = mq.receive('agent3');
  while (message) {
    console.log(`Agent3 received: ${JSON.stringify(message)}`);
    message = mq.receive('agent3');
  }
  
  // 显示消息历史
  console.log('\n=== Message History ===');
  const history = mq.getMessageHistory(5);
  history.forEach(msg => {
    console.log(`${msg.timestamp}: ${msg.type} - ${msg.content}`);
  });
}
