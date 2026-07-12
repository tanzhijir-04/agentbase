---
name: url-parser
description: >
  URL解析技能。解析和分析URL的各个组成部分。
  触发词包括：解析url、url解析、url分析、parse url、链接分析。
---

# URL Parser — URL解析

解析URL并展示其各个组成部分。

## 解析内容

- 协议（http/https/ftp）
- 域名
- 端口
- 路径
- 查询参数
- 锚点

## 示例

用户："解析这个url：https://example.com/page?id=1&name=test"
输出：
  协议: https
  域名: example.com
  路径: /page
  参数: id=1, name=test

## 注意

- 支持标准URL格式
- 对编码的URL进行解码显示
