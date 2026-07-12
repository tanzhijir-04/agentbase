# Multi-agent Demo Runner
# 运行所有Multi-agent相关的测试和演示

Write-Host "=== Multi-agent System Demo Runner ===" -ForegroundColor Green
Write-Host ""

# 进入minimal_agent目录
Set-Location -Path $PSScriptRoot

# 运行测试
Write-Host "1. Running Multi-agent tests..." -ForegroundColor Yellow
node tests/test_multi_agent.js
Write-Host ""

# 运行基础Multi-agent系统
Write-Host "2. Running basic Multi-agent system..." -ForegroundColor Yellow
node multi_agent_system.js
Write-Host ""

# 运行完整协作示例
Write-Host "3. Running Multi-agent collaboration example..." -ForegroundColor Yellow
node multi_agent_collaboration.js
Write-Host ""

# 运行演示
Write-Host "4. Running Multi-agent demo..." -ForegroundColor Yellow
node demos/demo_multi_agent.js
Write-Host ""

Write-Host "=== All demos completed! ===" -ForegroundColor Green
Write-Host ""
Write-Host "For more information, see:" -ForegroundColor Cyan
Write-Host "  - docs/tutorials/04-multi-agent/README.md" -ForegroundColor White
Write-Host "  - docs/tutorials/04-multi-agent/multi_agent_management_guide.md" -ForegroundColor White
Write-Host "  - docs/tutorials/04-multi-agent/multi_agent_learning_summary.md" -ForegroundColor White
