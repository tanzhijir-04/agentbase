/**
 * Multi-agent Collaboration - 完整的Multi-agent协作示例
 * 
 * 功能：
 * 1. 多个Agent协作完成复杂任务
 * 2. 任务分解和分配
 * 3. Agent间通信和协调
 * 4. 系统状态监控
 */

class MultiAgentSystem {
  constructor() {
    this.agents = new Map();
    this.messageQueue = [];
    this.taskBoard = new Map();
    this.eventHandlers = new Map();
  }

  // 注册Agent
  registerAgent(agent) {
    this.agents.set(agent.id, agent);
    agent.system = this;
    console.log(`Agent ${agent.id} registered`);
  }

  // 发送消息
  sendMessage(from, to, message) {
    this.messageQueue.push({
      from,
      to,
      message,
      timestamp: Date.now()
    });
    
    // 投递消息
    this.deliverMessage();
  }

  // 投递消息
  deliverMessage() {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      const targetAgent = this.agents.get(msg.to);
      
      if (targetAgent) {
        targetAgent.handleMessage(msg);
      } else {
        console.warn(`Agent ${msg.to} not found`);
      }
    }
  }

  // 创建任务
  createTask(task) {
    this.taskBoard.set(task.id, {
      ...task,
      status: 'created',
      assignee: null,
      createdAt: Date.now()
    });
    
    // 通知协调者
    this.notifyCoordinator('new_task', task);
  }

  // 通知协调者
  notifyCoordinator(event, data) {
    const coordinator = Array.from(this.agents.values())
      .find(agent => agent.role === 'coordinator');
    
    if (coordinator) {
      coordinator.handleEvent(event, data);
    }
  }

  // 获取系统状态
  getSystemStatus() {
    return {
      totalAgents: this.agents.size,
      activeTasks: Array.from(this.taskBoard.values())
        .filter(task => task.status !== 'completed').length,
      messageQueueSize: this.messageQueue.length,
      agents: Array.from(this.agents.values()).map(agent => agent.getStatus())
    };
  }

  // 事件订阅
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  // 触发事件
  emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
}

// 创建Agent类
class CollaborativeAgent {
  constructor(id, role, skills) {
    this.id = id;
    this.role = role;
    this.skills = skills;
    this.system = null;
    this.currentTask = null;
    this.isBusy = false;
  }

  // 处理消息
  handleMessage(msg) {
    console.log(`[${this.id}] Received from ${msg.from}: ${msg.message.type}`);
    
    switch (msg.message.type) {
      case 'task_assignment':
        this.handleTaskAssignment(msg.message.task);
        break;
      case 'request_help':
        this.handleHelpRequest(msg.from, msg.message);
        break;
      case 'task_complete':
        this.handleTaskComplete(msg.message);
        break;
      case 'help_available':
        this.handleHelpAvailable(msg.from, msg.message);
        break;
    }
  }

  // 处理任务分配
  handleTaskAssignment(task) {
    console.log(`[${this.id}] Assigning task: ${task.name}`);
    this.currentTask = task;
    this.isBusy = true;
    
    // 执行任务
    this.executeTask(task);
  }

  // 执行任务
  executeTask(task) {
    console.log(`[${this.id}] Executing task: ${task.name}`);
    
    // 模拟任务执行
    setTimeout(() => {
      this.completeTask(task);
    }, 2000);
  }

  // 完成任务
  completeTask(task) {
    console.log(`[${this.id}] Completed task: ${task.name}`);
    this.currentTask = null;
    this.isBusy = false;
    
    // 通知系统任务完成
    this.system.sendMessage(this.id, 'coordinator', {
      type: 'task_complete',
      taskId: task.id,
      result: 'success'
    });
  }

  // 处理帮助请求
  handleHelpRequest(from, request) {
    console.log(`[${this.id}] Received help request from ${from}`);
    
    // 根据能力决定是否提供帮助
    if (this.skills.includes(request.skill)) {
      this.system.sendMessage(this.id, from, {
        type: 'help_available',
        skill: request.skill
      });
    }
  }

  // 处理帮助可用
  handleHelpAvailable(from, message) {
    console.log(`[${this.id}] Agent ${from} can help with ${message.skill}`);
  }

  // 请求帮助
  requestHelp(skill) {
    this.system.sendMessage(this.id, 'coordinator', {
      type: 'request_help',
      skill: skill
    });
  }

  // 获取状态
  getStatus() {
    return {
      id: this.id,
      role: this.role,
      skills: this.skills,
      isBusy: this.isBusy,
      currentTask: this.currentTask
    };
  }
}

// 创建协调者
class Coordinator extends CollaborativeAgent {
  constructor() {
    super('coordinator', 'coordinator', ['coordination', 'monitoring']);
    this.taskQueue = [];
  }

  // 处理事件
  handleEvent(event, data) {
    switch (event) {
      case 'new_task':
        this.handleNewTask(data);
        break;
    }
  }

  // 处理新任务
  handleNewTask(task) {
    console.log(`[coordinator] New task received: ${task.name}`);
    
    // 分配任务
    this.assignTask(task);
  }

  // 分配任务
  assignTask(task) {
    // 查找合适的Agent
    const suitableAgent = this.findSuitableAgent(task);
    
    if (suitableAgent) {
      this.system.sendMessage(this.id, suitableAgent.id, {
        type: 'task_assignment',
        task: task
      });
    } else {
      // 加入队列等待
      this.taskQueue.push(task);
      console.log(`[coordinator] No suitable agent found. Task "${task.name}" queued.`);
    }
  }

  // 查找合适的Agent
  findSuitableAgent(task) {
    const agents = Array.from(this.system.agents.values());
    
    // 查找空闲且有能力的Agent
    return agents.find(agent => 
      agent.role === 'worker' && 
      !agent.isBusy &&
      task.requiredSkills.some(skill => agent.skills.includes(skill))
    );
  }

  // 处理任务完成
  handleTaskComplete(message) {
    console.log(`[coordinator] Task ${message.taskId} completed`);
    
    // 处理队列中的任务
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      this.assignTask(nextTask);
    }
  }

  // 监控系统
  monitorSystem() {
    const status = this.system.getSystemStatus();
    console.log('\n=== System Monitor ===');
    console.log(`Total Agents: ${status.totalAgents}`);
    console.log(`Active Tasks: ${status.activeTasks}`);
    console.log(`Message Queue: ${status.messageQueueSize}`);
    console.log('=====================\n');
  }
}

// 创建工作者
class Worker extends CollaborativeAgent {
  constructor(id, skills) {
    super(id, 'worker', skills);
  }

  // 执行任务
  executeTask(task) {
    console.log(`[${this.id}] Working on: ${task.name}`);
    
    // 模拟复杂任务处理
    const processingTime = Math.random() * 2000 + 1000;
    
    setTimeout(() => {
      this.completeTask(task);
    }, processingTime);
  }
}

// 使用示例
function runDemo() {
  console.log('=== Multi-agent Collaboration Demo ===\n');
  
  // 创建系统
  const system = new MultiAgentSystem();
  
  // 创建Agent
  const coordinator = new Coordinator();
  const worker1 = new Worker('worker1', ['coding', 'testing']);
  const worker2 = new Worker('worker2', ['design', 'documentation']);
  const worker3 = new Worker('worker3', ['coding', 'design']);
  
  // 注册Agent
  system.registerAgent(coordinator);
  system.registerAgent(worker1);
  system.registerAgent(worker2);
  system.registerAgent(worker3);
  
  // 显示初始状态
  coordinator.monitorSystem();
  
  // 创建任务
  console.log('Creating tasks...\n');
  
  system.createTask({
    id: 'task1',
    name: '实现用户登录功能',
    requiredSkills: ['coding']
  });
  
  system.createTask({
    id: 'task2',
    name: '设计登录页面',
    requiredSkills: ['design']
  });
  
  system.createTask({
    id: 'task3',
    name: '编写API文档',
    requiredSkills: ['documentation']
  });
  
  system.createTask({
    id: 'task4',
    name: '实现用户注册功能',
    requiredSkills: ['coding']
  });
  
  // 显示分配后状态
  setTimeout(() => {
    coordinator.monitorSystem();
    
    // 显示所有Agent状态
    console.log('=== Agent Status ===');
    Array.from(system.agents.values()).forEach(agent => {
      console.log(`${agent.id}: ${agent.isBusy ? 'Busy' : 'Idle'}`);
    });
  }, 1000);
  
  // 模拟任务完成后再次检查状态
  setTimeout(() => {
    console.log('\n=== After Task Completion ===');
    coordinator.monitorSystem();
    
    // 显示任务板状态
    console.log('=== Task Board ===');
    Array.from(system.taskBoard.values()).forEach(task => {
      console.log(`${task.id}: ${task.name} - ${task.status}`);
    });
  }, 4000);
}

// 运行示例
if (require.main === module) {
  runDemo();
}

// 导出模块
module.exports = {
  MultiAgentSystem,
  CollaborativeAgent,
  Coordinator,
  Worker
};
