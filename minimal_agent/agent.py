#!/usr/bin/env python3
"""
Minimal Coding Agent - 第一节课
根据教程要求：实现最小的coding agent，包含terminal执行和文件IO读写

这是每个AI Agent学习者的第一节课：
1. Terminal执行：运行命令并获取输出
2. 文件IO：读写文件
3. 基本的Agent循环：理解用户意图 -> 执行操作 -> 返回结果
"""

import subprocess
import os
import sys
from typing import Optional, Tuple


class MinimalCodingAgent:
    """
    最小的Coding Agent实现
    只包含两个核心功能：
    1. 执行terminal命令
    2. 读写文件
    """
    
    def __init__(self, working_directory: str = "."):
        self.working_directory = os.path.abspath(working_directory)
        self.history = []  # 记录操作历史
        
    def execute_command(self, command: str) -> Tuple[bool, str]:
        """
        核心功能1：执行terminal命令并返回输出
        
        Args:
            command: 要执行的shell命令
            
        Returns:
            Tuple[bool, str]: (是否成功, 命令输出)
        """
        try:
            # 记录到历史
            self.history.append(f"EXECUTE: {command}")
            
            # 执行命令
            result = subprocess.run(
                command,
                shell=True,
                cwd=self.working_directory,
                capture_output=True,
                text=True,
                timeout=30  # 30秒超时
            )
            
            # 获取输出
            stdout = result.stdout
            stderr = result.stderr
            return_code = result.returncode
            
            if return_code == 0:
                return True, stdout
            else:
                return False, f"Error (code {return_code}):\n{stderr}"
                
        except subprocess.TimeoutExpired:
            return False, "Error: Command timed out (30 seconds)"
        except Exception as e:
            return False, f"Error: {str(e)}"
    
    def read_file(self, file_path: str) -> Tuple[bool, str]:
        """
        核心功能2：读取文件内容
        
        Args:
            file_path: 文件路径（相对于working_directory）
            
        Returns:
            Tuple[bool, str]: (是否成功, 文件内容)
        """
        try:
            # 构建完整路径
            full_path = os.path.join(self.working_directory, file_path)
            full_path = os.path.abspath(full_path)
            
            # 记录到历史
            self.history.append(f"READ: {file_path}")
            
            # 检查文件是否存在
            if not os.path.exists(full_path):
                return False, f"Error: File not found: {file_path}"
            
            # 读取文件
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            return True, content
            
        except Exception as e:
            return False, f"Error reading file: {str(e)}"
    
    def write_file(self, file_path: str, content: str) -> Tuple[bool, str]:
        """
        核心功能2：写入文件内容
        
        Args:
            file_path: 文件路径（相对于working_directory）
            content: 要写入的内容
            
        Returns:
            Tuple[bool, str]: (是否成功, 消息)
        """
        try:
            # 构建完整路径
            full_path = os.path.join(self.working_directory, file_path)
            full_path = os.path.abspath(full_path)
            
            # 记录到历史
            self.history.append(f"WRITE: {file_path}")
            
            # 确保目录存在
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            # 写入文件
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            return True, f"Successfully wrote to {file_path}"
            
        except Exception as e:
            return False, f"Error writing file: {str(e)}"
    
    def get_history(self) -> list:
        """获取操作历史"""
        return self.history.copy()
    
    def clear_history(self):
        """清空历史记录"""
        self.history = []


def main():
    """
    交互式主循环
    这是Agent的核心：理解用户意图 -> 执行操作 -> 返回结果
    """
    print("=" * 60)
    print("🤖 Minimal Coding Agent - 第一节课")
    print("=" * 60)
    print("这是一个最小的coding agent，包含两个核心功能：")
    print("1. 执行terminal命令")
    print("2. 读写文件")
    print()
    print("命令格式：")
    print("  exec <command>     - 执行shell命令")
    print("  read <file>        - 读取文件")
    print("  write <file>       - 写入文件（然后输入内容，以END结束）")
    print("  history            - 查看操作历史")
    print("  quit               - 退出")
    print("=" * 60)
    
    agent = MinimalCodingAgent()
    
    while True:
        try:
            # 获取用户输入
            user_input = input("\n🤖 Agent> ").strip()
            
            if not user_input:
                continue
            
            # 解析命令
            parts = user_input.split(maxsplit=1)
            command = parts[0].lower()
            args = parts[1] if len(parts) > 1 else ""
            
            if command == "quit" or command == "exit":
                print("👋 再见！")
                break
            
            elif command == "exec":
                if not args:
                    print("❌ 用法: exec <command>")
                    continue
                    
                print(f"\n⏳ 执行命令: {args}")
                success, output = agent.execute_command(args)
                
                if success:
                    print(f"✅ 成功！\n{output}")
                else:
                    print(f"❌ 失败：\n{output}")
            
            elif command == "read":
                if not args:
                    print("❌ 用法: read <file>")
                    continue
                    
                print(f"\n📖 读取文件: {args}")
                success, content = agent.read_file(args)
                
                if success:
                    print(f"✅ 文件内容：\n{content}")
                else:
                    print(f"❌ {content}")
            
            elif command == "write":
                if not args:
                    print("❌ 用法: write <file>")
                    continue
                    
                print(f"\n✏️ 写入文件: {args}")
                print("请输入内容（输入END结束）：")
                
                lines = []
                while True:
                    line = input()
                    if line.strip() == "END":
                        break
                    lines.append(line)
                
                content = "\n".join(lines)
                success, message = agent.write_file(args, content)
                
                if success:
                    print(f"✅ {message}")
                else:
                    print(f"❌ {message}")
            
            elif command == "history":
                history = agent.get_history()
                if history:
                    print("\n📋 操作历史：")
                    for i, record in enumerate(history, 1):
                        print(f"  {i}. {record}")
                else:
                    print("📋 暂无历史记录")
            
            else:
                print(f"❌ 未知命令: {command}")
                print("可用命令: exec, read, write, history, quit")
                
        except KeyboardInterrupt:
            print("\n\n👋 再见！")
            break
        except Exception as e:
            print(f"❌ 错误: {str(e)}")


if __name__ == "__main__":
    main()
