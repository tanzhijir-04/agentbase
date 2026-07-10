# Git初始化和GitHub同步脚本

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🤖 AI Agent Study - Git初始化脚本" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查git是否安装
Write-Host "📋 检查Git安装..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git未安装，请先安装Git" -ForegroundColor Red
    Write-Host "下载地址: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# 检查当前目录
Write-Host ""
Write-Host "📁 当前目录: $(Get-Location)" -ForegroundColor Yellow

# 初始化git仓库（如果不存在）
Write-Host ""
Write-Host "🔧 初始化Git仓库..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git仓库已初始化" -ForegroundColor Green
} else {
    Write-Host "✅ Git仓库已存在" -ForegroundColor Green
}

# 添加所有文件
Write-Host ""
Write-Host "📦 添加文件到Git..." -ForegroundColor Yellow
git add -A
Write-Host "✅ 文件已添加" -ForegroundColor Green

# 创建初始提交
Write-Host ""
Write-Host "💾 创建初始提交..." -ForegroundColor Yellow
$commitMessage = @"
🎉 初始提交：AI Agent学习资源库

包含内容：
- 最小Coding Agent实现（JavaScript/Python版本）
- 完整学习路径指南
- 现代Agent特性详解
- 一周速成计划
- 快速开始指南
- 原始教程（峰哥AI学习视频文字版）

学习目标：
1. 理解Agent核心工作原理
2. 实现基本的Coding Agent
3. 掌握现代Agent关键特性
4. 具备进一步深入学习的基础
"@

git commit -m $commitMessage
Write-Host "✅ 初始提交已创建" -ForegroundColor Green

# 显示git状态
Write-Host ""
Write-Host "📊 Git状态:" -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Git初始化完成！" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 提供GitHub同步说明
Write-Host "📤 接下来同步到GitHub：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 在GitHub上创建新仓库：" -ForegroundColor White
Write-Host "   - 访问 https://github.com/new" -ForegroundColor Gray
Write-Host "   - 仓库名: AI-Agent-Study" -ForegroundColor Gray
Write-Host "   - 描述: AI Agent学习资源库" -ForegroundColor Gray
Write-Host "   - 选择 Public 或 Private" -ForegroundColor Gray
Write-Host "   - 不要勾选 'Initialize this repository with a README'" -ForegroundColor Gray
Write-Host "   - 点击 'Create repository'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 复制仓库URL（HTTPS或SSH）" -ForegroundColor White
Write-Host "   HTTPS: https://github.com/YOUR_USERNAME/AI-Agent-Study.git" -ForegroundColor Gray
Write-Host "   SSH: git@github.com:YOUR_USERNAME/AI-Agent-Study.git" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 运行以下命令同步：" -ForegroundColor White
Write-Host '   git remote add origin https://github.com/YOUR_USERNAME/AI-Agent-Study.git' -ForegroundColor Cyan
Write-Host '   git branch -M main' -ForegroundColor Cyan
Write-Host '   git push -u origin main' -ForegroundColor Cyan
Write-Host ""
Write-Host "4. 如果需要认证，GitHub会提示你登录" -ForegroundColor White
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🎉 完成后你的仓库就在GitHub上了！" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
