# MongoDB用户表设计文档

## 概述

本文档描述了MongoDB用户表的结构设计，用于存储每个用户使用过的会话ID。该设计支持用户管理、会话历史追踪和用户活跃度分析等功能。

## 表结构设计

### 集合名称：users

#### 文档结构

```json
{
  "_id": ObjectId("..."),           // MongoDB自动生成的唯一ID
  "user_id": "user_001",            // 用户唯一标识符（业务ID）
  "username": "测试用户",           // 用户名
  "email": "user@example.com",     // 用户邮箱（可选）
  "agents": ["agent_001", "agent_002"], // 关联的智能体ID数组
  "session_ids": [                  // 会话ID数组，按添加时间排序
    {"id":"session_001","agent_id":"agent_001"},
    {"id":"session_002","agent_id":"agent_002"}, 
    {"id":"session_003","agent_id":"agent_001"}
  ],
  "session_count": 3,               // 会话总数（冗余字段，便于查询）
  "created_at": ISODate("2024-01-01T00:00:00Z"),     // 用户创建时间
  "updated_at": ISODate("2024-01-15T12:30:00Z"),     // 最后更新时间
  "last_active": ISODate("2024-01-15T12:30:00Z"),    // 最后活跃时间
  "metadata": {                     // 用户元数据（可扩展）
    "source": "web",
    "plan": "premium",
    "language": "zh-CN"
  }
}
```

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user_id | string | 是 | 用户唯一标识符，业务主键 |
| username | string | 否 | 用户名，默认为user_id |
| email | string | 否 | 用户邮箱地址 |
| session_ids | array | 是 | 会话ID数组，使用addToSet避免重复 |
| session_count | integer | 是 | 会话总数，便于快速查询 |
| created_at | datetime | 是 | 用户创建时间 |
| updated_at | datetime | 是 | 最后更新时间 |
| last_active | datetime | 是 | 最后活跃时间 |
| metadata | object | 否 | 用户元数据，可扩展存储额外信息 |

#### 索引设计

```javascript
// 用户ID唯一索引
db.users.createIndex({"user_id": 1}, {unique: true})

// 会话ID索引，便于查询包含特定会话的用户
db.users.createIndex({"session_ids": 1})

// 创建时间索引，便于按时间排序
db.users.createIndex({"created_at": -1})

// 最后活跃时间索引，便于活跃用户查询
db.users.createIndex({"last_active": -1})

// 复合索引示例：按最后活跃时间和会话数量查询
db.users.createIndex({"last_active": -1, "session_count": -1})
```

## 核心功能

### 1. 用户管理
- 创建新用户
- 获取用户信息
- 更新用户元数据
- 删除用户

### 2. 会话管理
- 添加会话ID到用户
- 获取用户的所有会话ID
- 防止重复添加相同会话ID

### 3. 用户活跃度分析
- 查询最近活跃的用户
- 统计用户会话数量
- 分析用户使用模式

## 使用示例

### Python代码示例

#### 创建用户
```python
from src.db.user_model import UserModel

user_model = UserModel()
success = user_model.create_user(
    user_id="user_001",
    username="测试用户",
    email="user@example.com",
    metadata={"source": "web", "plan": "premium"}
)
```

#### 添加会话
```python
# 为用户添加会话ID
success = user_model.add_session_to_user("user_001", "session_abc123")
```

#### 获取用户会话
```python
# 获取用户的所有会话ID
sessions = user_model.get_user_sessions("user_001")
print(f"用户会话数量: {len(sessions)}")
print(f"会话列表: {sessions}")
```

#### 获取活跃用户
```python
# 获取最近30天内活跃的10个用户
active_users = user_model.get_active_users(days=30, limit=10)
for user in active_users:
    print(f"用户: {user['user_id']}, 会话数: {user['session_count']}")
```

### API接口示例

#### 创建用户
```bash
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_001",
    "username": "测试用户",
    "email": "user@example.com",
    "metadata": {
      "source": "web",
      "plan": "premium"
    }
  }'
```

#### 添加会话
```bash
curl -X POST "http://localhost:8000/api/users/user_001/sessions" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session_abc123"
  }'
```

#### 获取用户信息
```bash
curl "http://localhost:8000/api/users/user_001"
```

#### 获取用户会话
```bash
curl "http://localhost:8000/api/users/user_001/sessions?limit=10"
```

## 设计优势

### 1. 数据完整性
- 使用`addToSet`操作符确保会话ID不会重复
- 自动维护会话数量计数器
- 时间戳自动更新

### 2. 查询性能
- 合理的索引设计优化查询性能
- 支持多种查询模式（按用户、按会话、按时间）
- 冗余字段减少复杂查询

### 3. 可扩展性
- 元数据字段支持灵活扩展
- 支持多种用户属性存储
- 易于添加新的功能字段

### 4. 数据一致性
- 原子性操作确保数据一致性
- 事务支持（在需要时）
- 错误处理和异常管理

## 最佳实践

### 1. 用户ID设计
- 使用业务相关的唯一标识符
- 避免使用个人敏感信息作为user_id
- 考虑使用UUID或自定义编码规则

### 2. 会话管理
- 会话ID应该具有唯一性
- 考虑会话过期策略
- 定期清理过期会话数据

### 3. 性能优化
- 合理使用索引，避免过度索引
- 定期分析和优化查询性能
- 考虑数据分片（大数据量时）

### 4. 数据安全
- 敏感信息加密存储
- 实施适当的访问控制
- 定期备份重要数据

## 扩展功能建议

### 1. 会话详情存储
可以扩展设计，为每个会话存储更多详细信息：
```json
{
  "sessions": [
    {
      "session_id": "session_001",
      "start_time": ISODate("2024-01-01T10:00:00Z"),
      "end_time": ISODate("2024-01-01T11:30:00Z"),
      "duration": 90,  // 分钟
      "messages_count": 25,
      "ip_address": "192.168.1.1"
    }
  ]
}
```

### 2. 用户行为分析
添加用户行为统计字段：
```json
{
  "behavior_stats": {
    "total_messages": 150,
    "avg_session_duration": 45,
    "most_active_hour": 14,
    "preferred_language": "zh-CN"
  }
}
```

### 3. 用户标签系统
支持给用户打标签：
```json
{
  "tags": ["活跃用户", "付费用户", "技术用户"]
}
```

## 故障排除

### 常见问题

1. **重复用户ID**: 确保user_id的唯一性，捕获DuplicateKeyError异常
2. **会话重复**: 使用addToSet操作符避免重复会话ID
3. **性能问题**: 检查索引是否正确创建，查询是否合理
4. **数据一致性**: 使用原子性操作，避免并发修改问题

### 监控建议

- 监控数据库查询性能
- 监控用户增长趋势
- 监控会话数据增长
- 设置适当的告警机制

## 总结

这个MongoDB用户表设计提供了完整的用户管理和会话追踪功能，支持高并发访问和灵活的数据扩展。通过合理的设计和最佳实践，可以构建一个可靠、高效的用户管理系统。