# 🚀 快速开始指南

## 第一步：运行你的Agent

打开终端，运行以下命令：

```bash
# 进入agent目录
cd minimal_agent

# 运行JavaScript版本（推荐）
node agent.js

# 或者运行Python版本（需要Python环境）
python agent.py
```

## 第二步：尝试基本命令

### 1. 执行命令
```
🤖 Agent> exec echo "Hello, Agent!"
```

### 2. 创建文件
```
🤖 Agent> write my_first_file.txt
请输入内容（输入END结束）：
这是我的第一个文件
由Minimal Agent创建
END
```

### 3. 读取文件
```
🤖 Agent> read my_first_file.txt
```

### 4. 查看历史
```
🤖 Agent> history
```

### 5. 退出
```
🤖 Agent> quit
```

## 第三步：理解Agent的工作原理

你的Agent包含两个核心功能：

### 功能1：执行命令（executeCommand）
```javascript
// 伪代码
function executeCommand(command) {
    // 1. 记录到历史
    history.push(command)
    
    // 2. 执行shell命令
    output = runShellCommand(command)
    
    // 3. 返回结果
    return { success: true, output: output }
}
```

### 功能2：读写文件（readFile/writeFile）
```javascript
// 伪代码
function readFile(filePath) {
    // 1. 检查文件是否存在
    if (!fileExists(filePath)) {
        return error("File not found")
    }
    
    // 2. 读取文件内容
    content = readFromFile(filePath)
    
    // 3. 返回内容
    return { success: true, content: content }
}
```

## 第四步：思考和扩展

### 你的Agent可以改进的地方：

1. **添加新命令**：
   - `listFiles` - 列出当前目录的文件
   - `deleteFile` - 删除文件
   - `copyFile` - 复制文件

2. **改进用户体验**：
   - 添加命令自动补全
   - 添加命令历史记录（上下键）
   - 添加彩色输出

3. **添加高级功能**：
   - Plan mode（计划模式）
   - Memory系统（记忆）
   - Context compression（上下文压缩）

## 🎯 挑战任务

### 初级挑战（今天）
- [ ] 运行agent并测试所有命令
- [ ] 创建一个包含多行内容的文件
- [ ] 读取一个现有的文件

### 中级挑战（本周）
- [ ] 添加`listFiles`命令
- [ ] 添加`deleteFile`命令
- [ ] 改进错误提示信息

### 高级挑战（下周）
- [ ] 实现简单的Plan mode
- [ ] 添加命令历史记录
- [ ] 实现文件搜索功能

## 💡 提示

### 如果遇到问题：
1. **命令执行失败**：检查命令是否正确，路径是否存在
2. **文件读写错误**：检查文件权限和路径
3. **Node.js版本问题**：确保使用Node.js 14+

### 学习建议：
1. **先理解，再修改**：先读懂代码，再尝试修改
2. **小步快跑**：每次只添加一个功能
3. **测试验证**：每次修改后都要测试

## 📚 下一步

完成快速开始后：
1. 阅读`LEARNING_GUIDE.md`了解完整学习路径
2. 阅读`README.md`了解详细功能说明
3. 开始扩展你的agent！

---

*记住：这是你的第一节课，完成它，你就入门了！*
