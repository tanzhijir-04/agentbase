---
name: http-request
description: >
  HTTP请求技能。发送HTTP请求获取网络资源。
  触发词包括：http请求、http、fetch、api请求、get请求、post请求、网络请求。
---

# HTTP Request — HTTP请求

发送HTTP请求并返回响应结果。

## 能力

- GET请求：获取资源
- POST请求：提交数据
- URL验证：检查URL格式正确性

## 流程

1. 解析URL地址
2. 确定请求方法（GET/POST）
3. 执行请求（模拟或真实）
4. 返回响应内容

## 注意

- 验证URL格式的正确性
- 不支持访问内网地址（安全考虑）
- 模拟数据需标注
