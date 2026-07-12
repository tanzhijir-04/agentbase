# Multi-agent Test Runner
# 运行所有Multi-agent相关的测试

Write-Host "=== Multi-agent System Test Runner ===" -ForegroundColor Green
Write-Host ""

# 进入minimal_agent目录
Set-Location -Path $PSScriptRoot

# 运行测试
Write-Host "Running Multi-agent tests..." -ForegroundColor Yellow
node tests/test_multi_agent.js
Write-Host ""

Write-Host "=== Tests completed! ===" -ForegroundColor Green
