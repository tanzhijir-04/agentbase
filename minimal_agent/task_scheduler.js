/**
 * Task Scheduler - 任务调度器
 * 
 * 功能：
 * 1. 任务管理（添加、删除、更新）
 * 2. 依赖关系处理
 * 3. 智能任务分配
 * 4. 调度策略（FIFO、优先级、依赖）
 */

class TaskScheduler {
  constructor() {
    this.tasks = new Map(); // taskId -> task
    this.agents = new Map(); // agentId -> agent
    this.dependencies = new Map(); // taskId -> [dependencyIds]
    this.schedulingStrategy = 'dependency'; // 调度策略
  }

  // 添加任务
  addTask(task) {
    this.tasks.set(task.id, {
      ...task,
      status: 'pending',
      assignedTo: null,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null
    });
    
    // 处理依赖关系
    if (task.dependencies && task.dependencies.length > 0) {
      this.dependencies.set(task.id, task.dependencies);
    }
    
    console.log(`Task added: ${task.id} - ${task.name}`);
    return task.id;
  }

  // 删除任务
  removeTask(taskId) {
    if (this.tasks.has(taskId)) {
      this.tasks.delete(taskId);
      this.dependencies.delete(taskId);
      console.log(`Task removed: ${taskId}`);
      return true;
    }
    return false;
  }

  // 更新任务状态
  updateTaskStatus(taskId, status) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      
      if (status === 'in_progress') {
        task.startedAt = Date.now();
      } else if (status === 'completed') {
        task.completedAt = Date.now();
        
        // 调度依赖此任务的其他任务
        this.schedule();
      }
      
      console.log(`Task ${taskId} status updated to: ${status}`);
      return true;
    }
    return false;
  }

  // 添加Agent
  addAgent(agent) {
    this.agents.set(agent.id, agent);
    console.log(`Agent added: ${agent.id}`);
  }

  // 移除Agent
  removeAgent(agentId) {
    if (this.agents.has(agentId)) {
      this.agents.delete(agentId);
      console.log(`Agent removed: ${agentId}`);
      return true;
    }
    return false;
  }

  // 检查任务依赖是否满足
  dependenciesMet(taskId) {
    const deps = this.dependencies.get(taskId) || [];
    return deps.every(depId => {
      const depTask = this.tasks.get(depId);
      return depTask && depTask.status === 'completed';
    });
  }

  // 获取可执行任务
  getExecutableTasks() {
    return Array.from(this.tasks.values())
      .filter(task => 
        task.status === 'pending' && 
        this.dependenciesMet(task.id)
      );
  }

  // 获取空闲Agent
  getAvailableAgents() {
    return Array.from(this.agents.values())
      .filter(agent => !agent.isBusy);
  }

  // 查找合适的Agent
  findSuitableAgent(task) {
    const availableAgents = this.getAvailableAgents();
    
    // 根据任务要求的技能查找匹配的Agent
    return availableAgents.find(agent => {
      if (task.requiredSkills && task.requiredSkills.length > 0) {
        return task.requiredSkills.some(skill => 
          agent.capabilities && agent.capabilities.includes(skill)
        );
      }
      return true; // 如果没有技能要求，任何空闲Agent都可以
    });
  }

  // 调度任务
  schedule() {
    console.log('\n=== Scheduling Tasks ===');
    
    const executableTasks = this.getExecutableTasks();
    console.log(`Found ${executableTasks.length} executable tasks`);
    
    // 根据调度策略排序任务
    const sortedTasks = this.sortTasks(executableTasks);
    
    // 分配任务
    sortedTasks.forEach(task => {
      const agent = this.findSuitableAgent(task);
      
      if (agent) {
        this.assignTaskToAgent(task.id, agent.id);
      } else {
        console.log(`No suitable agent found for task: ${task.id}`);
      }
    });
    
    console.log('=== Scheduling Complete ===\n');
  }

  // 任务排序
  sortTasks(tasks) {
    switch (this.schedulingStrategy) {
      case 'fifo':
        return tasks.sort((a, b) => a.createdAt - b.createdAt);
      
      case 'priority':
        return tasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      case 'dependency':
      default:
        // 按依赖深度排序（依赖少的优先）
        return tasks.sort((a, b) => {
          const aDeps = this.dependencies.get(a.id) || [];
          const bDeps = this.dependencies.get(b.id) || [];
          return aDeps.length - bDeps.length;
        });
    }
  }

  // 分配任务给Agent
  assignTaskToAgent(taskId, agentId) {
    const task = this.tasks.get(taskId);
    const agent = this.agents.get(agentId);
    
    if (task && agent) {
      task.status = 'assigned';
      task.assignedTo = agentId;
      
      // 通知Agent执行任务
      if (agent.receiveMessage) {
        agent.receiveMessage({
          type: 'task_assignment',
          taskId: taskId,
          task: task
        });
      }
      
      console.log(`Task ${taskId} assigned to agent ${agentId}`);
      return true;
    }
    return false;
  }

  // 完成任务
  completeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (task) {
      this.updateTaskStatus(taskId, 'completed');
      
      // 调度依赖此任务的其他任务
      this.schedule();
      
      return true;
    }
    return false;
  }

  // 获取任务状态
  getTaskStatus(taskId) {
    return this.tasks.get(taskId)?.status;
  }

  // 获取所有任务状态
  getAllTasksStatus() {
    return Array.from(this.tasks.values()).map(task => ({
      id: task.id,
      name: task.name,
      status: task.status,
      assignedTo: task.assignedTo,
      createdAt: task.createdAt,
      startedAt: task.startedAt,
      completedAt: task.completedAt
    }));
  }

  // 获取系统状态
  getSystemStatus() {
    const tasks = Array.from(this.tasks.values());
    const agents = Array.from(this.agents.values());
    
    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      assignedTasks: tasks.filter(t => t.status === 'assigned').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      totalAgents: agents.length,
      busyAgents: agents.filter(a => a.isBusy).length,
      idleAgents: agents.filter(a => !a.isBusy).length,
      schedulingStrategy: this.schedulingStrategy
    };
  }

  // 设置调度策略
  setSchedulingStrategy(strategy) {
    if (['fifo', 'priority', 'dependency'].includes(strategy)) {
      this.schedulingStrategy = strategy;
      console.log(`Scheduling strategy set to: ${strategy}`);
      return true;
    }
    return false;
  }
}

// 导出模块
module.exports = TaskScheduler;

// 如果直接运行此文件，执行示例
if (require.main === module) {
  console.log('=== Task Scheduler Demo ===\n');
  
  const scheduler = new TaskScheduler();
  
  // 添加任务（带依赖关系）
  scheduler.addTask({
    id: 'task1',
    name: '设计数据库',
    requiredSkills: ['design'],
    dependencies: []
  });
  
  scheduler.addTask({
    id: 'task2',
    name: '实现API',
    requiredSkills: ['coding'],
    dependencies: ['task1']
  });
  
  scheduler.addTask({
    id: 'task3',
    name: '编写前端',
    requiredSkills: ['coding', 'design'],
    dependencies: ['task1']
  });
  
  scheduler.addTask({
    id: 'task4',
    name: '编写测试',
    requiredSkills: ['testing'],
    dependencies: ['task2', 'task3']
  });
  
  // 添加Agent
  const agent1 = {
    id: 'designer',
    isBusy: false,
    capabilities: ['design']
  };
  
  const agent2 = {
    id: 'developer',
    isBusy: false,
    capabilities: ['coding', 'testing']
  };
  
  scheduler.addAgent(agent1);
  scheduler.addAgent(agent2);
  
  // 显示初始状态
  console.log('Initial Status:');
  console.log(JSON.stringify(scheduler.getSystemStatus(), null, 2));
  
  // 第一次调度
  console.log('\n--- First Schedule ---');
  scheduler.schedule();
  
  // 显示调度后状态
  console.log('\nAfter First Schedule:');
  console.log(JSON.stringify(scheduler.getSystemStatus(), null, 2));
  
  // 完成任务1
  console.log('\n--- Completing Task 1 ---');
  scheduler.completeTask('task1');
  
  // 显示任务状态
  console.log('\nTask Status:');
  console.log(JSON.stringify(scheduler.getAllTasksStatus(), null, 2));
  
  // 第二次调度
  console.log('\n--- Second Schedule ---');
  scheduler.schedule();
  
  // 显示最终状态
  console.log('\nFinal Status:');
  console.log(JSON.stringify(scheduler.getSystemStatus(), null, 2));
}
