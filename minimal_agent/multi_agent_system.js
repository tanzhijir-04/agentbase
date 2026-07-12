/**
 * Multi-agent System - 基础Multi-agent系统实现
 * 
 * 功能：
 * 1. Agent注册和管理
 * 2. 消息通信系统
 * 3. 任务分配和调度
 * 4. 系统状态监控
 */

class Agent {
  constructor(id, role, capabilities) {
    this.id = id;
    this.role = role;
    this.capabilities = capabilities;
    this.messageQueue = [];
    this.isBusy = false;
    this.currentTask = null;
  }

  // 接收消息
  receiveMessage(message) {
    this.messageQueue.push(message);
    this.processMessage();
  }

  // 处理消息
  processMessage() {
    if (this.messageQueue.length > 0 && !this.isBusy) {
      const message = this.messageQueue.shift();
      this.handleMessage(message);
    }
  }

  // 处理具体消息
  handleMessage(message) {
    console.log(`Agent ${this.id} received: ${message.type}`);
    
    switch (message.type) {
      case 'task':
        this.executeTask(message);
        break;
      case 'query':
        this.handleQuery(message);
        break;
      case 'response':
        this.handleResponse(message);
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  // 执行任务
  executeTask(task) {
    this.isBusy = true;
    this.currentTask = task;
    console.log(`Agent ${this.id} executing task: ${task.content}`);
    
    // 模拟任务执行
    setTimeout(() => {
      this.completeTask(task);
    }, 1000);
  }

  // 完成任务
  completeTask(task) {
    this.isBusy = false;
    this.currentTask = null;
    console.log(`Agent ${this.id} completed task: ${task.content}`);
    
    // 发送完成消息
    this.sendMessage({
      type: 'task_complete',
      taskId: task.id,
      agentId: this.id,
      result: 'success'
    });
  }

  // 发送消息
  sendMessage(message) {
    console.log(`Agent ${this.id} sending: ${message.type}`);
    // 这里应该实现实际的消息发送逻辑
  }

  // 处理查询
  handleQuery(query) {
    console.log(`Agent ${this.id} handling query: ${query.content}`);
  }

  // 处理响应
  handleResponse(response) {
    console.log(`Agent ${this.id} handling response: ${response.content}`);
  }

  // 获取状态
  getStatus() {
    return {
      id: this.id,
      role: this.role,
      isBusy: this.isBusy,
      currentTask: this.currentTask,
      capabilities: this.capabilities
    };
  }
}

// 协调者Agent
class CoordinatorAgent extends Agent {
  constructor() {
    super('coordinator', 'coordinator', ['task_assignment', 'monitoring']);
    this.workers = [];
    this.taskQueue = [];
  }

  // 添加工作者
  addWorker(worker) {
    this.workers.push(worker);
    console.log(`Added worker: ${worker.id}`);
  }

  // 分配任务
  assignTask(task) {
    // 查找空闲的worker
    const availableWorker = this.workers.find(worker => !worker.isBusy);
    
    if (availableWorker) {
      availableWorker.receiveMessage({
        type: 'task',
        content: task
      });
      return true;
    } else {
      // 所有worker都忙，任务加入队列
      this.taskQueue.push(task);
      console.log(`All workers busy. Task "${task.content}" added to queue.`);
      return false;
    }
  }

  // 监控系统状态
  monitorSystem() {
    const busyWorkers = this.workers.filter(worker => worker.isBusy);
    const idleWorkers = this.workers.filter(worker => !worker.isBusy);
    
    console.log('\n=== System Status ===');
    console.log(`Total workers: ${this.workers.length}`);
    console.log(`Busy workers: ${busyWorkers.length}`);
    console.log(`Idle workers: ${idleWorkers.length}`);
    console.log(`Queued tasks: ${this.taskQueue.length}`);
    console.log('=====================\n');
  }

  // 获取所有worker状态
  getWorkersStatus() {
    return this.workers.map(worker => worker.getStatus());
  }
}

// 工作者Agent
class WorkerAgent extends Agent {
  constructor(id, skills) {
    super(id, 'worker', skills);
  }

  // 检查是否有能力执行任务
  canExecuteTask(task) {
    // 任务可能直接包含requiredSkills，或者在content中包含
    const requiredSkills = task.requiredSkills || (task.content && task.content.requiredSkills) || [];
    return requiredSkills.some(skill => this.capabilities.includes(skill));
  }

  // 执行任务
  executeTask(task) {
    if (this.canExecuteTask(task)) {
      console.log(`Worker ${this.id} has required skills for task: ${task.content}`);
      super.executeTask(task);
    } else {
      console.log(`Worker ${this.id} lacks skills for task: ${task.content}`);
      this.sendMessage({
        type: 'task_rejected',
        taskId: task.id,
        agentId: this.id,
        reason: 'insufficient_skills'
      });
    }
  }
}

// 导出模块
module.exports = {
  Agent,
  CoordinatorAgent,
  WorkerAgent
};

// 如果直接运行此文件，执行示例
if (require.main === module) {
  console.log('=== Multi-agent System Demo ===\n');
  
  // 创建协调者
  const coordinator = new CoordinatorAgent();
  
  // 创建工作者
  const worker1 = new WorkerAgent('worker1', ['coding', 'testing']);
  const worker2 = new WorkerAgent('worker2', ['design', 'documentation']);
  const worker3 = new WorkerAgent('worker3', ['coding', 'design']);
  
  // 添加工作者到协调者
  coordinator.addWorker(worker1);
  coordinator.addWorker(worker2);
  coordinator.addWorker(worker3);
  
  // 显示初始状态
  coordinator.monitorSystem();
  
  // 分配任务
  console.log('Assigning tasks...\n');
  
  coordinator.assignTask({
    id: 'task1',
    content: '实现用户认证模块',
    requiredSkills: ['coding']
  });
  
  coordinator.assignTask({
    id: 'task2',
    content: '设计数据库结构',
    requiredSkills: ['design']
  });
  
  coordinator.assignTask({
    id: 'task3',
    content: '编写API文档',
    requiredSkills: ['documentation']
  });
  
  coordinator.assignTask({
    id: 'task4',
    content: '实现支付功能',
    requiredSkills: ['coding']
  });
  
  // 显示分配后状态
  coordinator.monitorSystem();
  
  // 模拟任务完成后再次检查状态
  setTimeout(() => {
    console.log('\n=== After task completion ===');
    coordinator.monitorSystem();
  }, 2000);
}
