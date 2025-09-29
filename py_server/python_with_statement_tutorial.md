# Python with语句详解与使用教程

## 目录
1. [什么是with语句](#什么是with语句)
2. [基本语法](#基本语法)
3. [工作原理](#工作原理)
4. [常见应用场景](#常见应用场景)
5. [自定义上下文管理器](#自定义上下文管理器)
6. [最佳实践](#最佳实践)
7. [常见错误与调试](#常见错误与调试)

## 什么是with语句

`with`语句是Python中用于简化资源管理的一种语法结构，它能确保在代码块执行完毕后正确清理资源，即使发生异常也能保证资源被正确释放。

### 核心优势
- **自动资源清理**：无需手动关闭文件、网络连接等资源
- **异常安全**：即使发生异常也能保证清理代码被执行
- **代码简洁**：减少样板代码，提高可读性

## 基本语法

### 基本结构
```python
with 表达式 as 变量:
    代码块
```

### 文件操作示例
```python
# 传统方式
file = open('example.txt', 'r')
try:
    content = file.read()
    print(content)
finally:
    file.close()

# 使用with语句（推荐）
with open('example.txt', 'r') as file:
    content = file.read()
    print(content)
# 文件在这里会自动关闭
```

## 工作原理

### 上下文管理器协议
`with`语句依赖于**上下文管理器协议**，要求对象实现以下两个方法：

1. `__enter__(self)`: 进入上下文时调用
2. `__exit__(self, exc_type, exc_val, exc_tb)`: 退出上下文时调用

### 执行流程
```python
with EXPRESSION as VARIABLE:
    BLOCK
```

实际执行步骤：
1. 执行`EXPRESSION`获取上下文管理器对象
2. 调用对象的`__enter__()`方法
3. 将`__enter__()`的返回值赋给`VARIABLE`（如果有as子句）
4. 执行`BLOCK`代码块
5. 无论是否发生异常，都会调用`__exit__()`方法

## 常见应用场景

### 1. 文件操作
```python
# 读取文件
with open('data.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for line in lines:
        print(line.strip())

# 写入文件
with open('output.txt', 'w') as f:
    f.write('Hello, World!\n')
    f.writelines(['Line 1\n', 'Line 2\n'])

# 同时处理多个文件
with open('input.txt', 'r') as infile, open('output.txt', 'w') as outfile:
    for line in infile:
        outfile.write(line.upper())
```

### 2. 网络连接
```python
import urllib.request

with urllib.request.urlopen('https://httpbin.org/get') as response:
    data = response.read()
    print(data.decode('utf-8'))
```

### 3. 数据库连接
```python
import sqlite3

with sqlite3.connect('example.db') as conn:
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)')
    cursor.execute('INSERT INTO users (name) VALUES (?)', ('Alice',))
    conn.commit()
    # 连接会自动关闭
```

### 4. 线程锁
```python
import threading

lock = threading.Lock()

with lock:
    # 临界区代码
    shared_variable += 1
    print(f"Updated value: {shared_variable}")
```

### 5. 临时文件和目录
```python
import tempfile
import os

# 临时文件
with tempfile.NamedTemporaryFile(mode='w+', delete=True) as temp:
    temp.write('Temporary content')
    temp.seek(0)
    print(temp.read())

# 临时目录
with tempfile.TemporaryDirectory() as temp_dir:
    file_path = os.path.join(temp_dir, 'temp_file.txt')
    with open(file_path, 'w') as f:
        f.write('Content in temp directory')
    print(f"Files in temp dir: {os.listdir(temp_dir)}")
```

## 自定义上下文管理器

### 方法一：使用类实现
```python
class ManagedFile:
    """自定义文件上下文管理器"""
    
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        """进入上下文时调用"""
        print(f"Opening file: {self.filename}")
        self.file = open(self.filename, self.mode)
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """退出上下文时调用"""
        if self.file:
            self.file.close()
            print(f"Closing file: {self.filename}")
        
        if exc_type is not None:
            print(f"An error occurred: {exc_val}")
        
        return False  # 不抑制异常

# 使用自定义上下文管理器
with ManagedFile('test.txt', 'w') as f:
    f.write('Hello from custom context manager!')
```

### 方法二：使用contextlib模块
```python
from contextlib import contextmanager

@contextmanager
def managed_resource(name):
    """使用生成器创建上下文管理器"""
    print(f"Acquiring resource: {name}")
    resource = f"Resource-{name}"
    try:
        yield resource
    finally:
        print(f"Releasing resource: {name}")

# 使用
with managed_resource("database") as db:
    print(f"Using {db}")
    # 这里可以使用db资源

# 带异常处理的版本
@contextmanager
def safe_divide():
    """安全的除法上下文管理器"""
    try:
        yield
    except ZeroDivisionError as e:
        print(f"Division by zero error: {e}")
        yield "undefined"

with safe_divide():
    result = 10 / 0
    print(f"Result: {result}")
```

### 高级自定义示例
```python
import time
from contextlib import contextmanager

@contextmanager
def timer(description="Elapsed time"):
    """计时器上下文管理器"""
    start = time.time()
    try:
        yield
    finally:
        elapsed = time.time() - start
        print(f"{description}: {elapsed:.2f} seconds")

@contextmanager
def suppress(*exceptions):
    """抑制特定异常的上下文管理器"""
    try:
        yield
    except exceptions as e:
        print(f"Suppressed exception: {e}")

# 使用示例
with timer("File processing"):
    # 模拟耗时操作
    time.sleep(1)
    print("Processing complete")

with suppress(ValueError, TypeError):
    # 这些异常会被抑制
    int("invalid")
    1 / 0
```

## 最佳实践

### 1. 嵌套with语句
```python
# 方法1：嵌套结构
with open('input.txt', 'r') as infile:
    with open('output.txt', 'w') as outfile:
        for line in infile:
            outfile.write(line.upper())

# 方法2：单行多个上下文管理器（Python 3.1+）
with open('input.txt', 'r') as infile, open('output.txt', 'w') as outfile:
    for line in infile:
        outfile.write(line.upper())
```

### 2. 错误处理策略
```python
class DatabaseTransaction:
    """数据库事务上下文管理器"""
    
    def __init__(self, connection):
        self.conn = connection
    
    def __enter__(self):
        self.conn.begin()
        return self.conn
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.conn.commit()
            print("Transaction committed")
        else:
            self.conn.rollback()
            print("Transaction rolled back")
            return False  # 不抑制异常，让调用者处理

# 使用
import sqlite3
with sqlite3.connect('example.db') as conn:
    with DatabaseTransaction(conn) as cursor:
        cursor.execute("INSERT INTO users (name) VALUES ('Bob')")
        # 如果这里发生异常，事务会自动回滚
```

### 3. 异步上下文管理器（Python 3.7+）
```python
import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def async_database_connection(url):
    """异步数据库连接上下文管理器"""
    print(f"Connecting to {url}")
    connection = await create_async_connection(url)
    try:
        yield connection
    finally:
        print("Closing connection")
        await connection.close()

# 使用（需要在async函数中）
async def main():
    async with async_database_connection("sqlite:///test.db") as conn:
        result = await conn.execute("SELECT * FROM users")
        print(await result.fetchall())
```

## 常见错误与调试

### 1. 常见错误
```python
# 错误1：忘记as关键字
with open('file.txt', 'r'):
    content = read()  # NameError: name 'read' is not defined

# 正确做法
with open('file.txt', 'r') as f:
    content = f.read()

# 错误2：在with块外使用资源
with open('file.txt', 'r') as f:
    pass

print(f.read())  # ValueError: I/O operation on closed file
```

### 2. 调试技巧
```python
class DebugContext:
    """调试用的上下文管理器"""
    
    def __init__(self, name):
        self.name = name
    
    def __enter__(self):
        print(f"[{self.name}] Entering context")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            print(f"[{self.name}] Exception occurred: {exc_type.__name__}: {exc_val}")
        else:
            print(f"[{self.name}] Exiting normally")
        return False

# 使用调试上下文
with DebugContext("file_processing"):
    with open('nonexistent.txt', 'r') as f:
        content = f.read()
```

### 3. 性能考虑
```python
import time
from contextlib import contextmanager

@contextmanager
def performance_monitor():
    """性能监控上下文管理器"""
    start = time.time()
    memory_start = get_memory_usage()
    
    try:
        yield
    finally:
        elapsed = time.time() - start
        memory_used = get_memory_usage() - memory_start
        print(f"Time: {elapsed:.2f}s, Memory: {memory_used}MB")

# 使用
with performance_monitor():
    # 你的代码
    process_large_dataset()
```

## 总结

`with`语句是Python中管理资源的重要工具，它通过上下文管理器协议提供了安全、简洁的资源管理方式。掌握`with`语句的使用可以：

1. **提高代码可靠性**：确保资源正确清理
2. **增强代码可读性**：减少样板代码
3. **简化异常处理**：自动处理异常情况下的清理工作
4. **支持自定义扩展**：可以创建自己的上下文管理器

在实际开发中，应该优先使用`with`语句来处理文件、网络连接、数据库连接等需要显式清理的资源。

## 附录：MongoDB查询语法与应用

在项目中，`get_collection_data`函数使用了`query`参数来过滤MongoDB集合中的数据。下面详细介绍如何编写MongoDB查询条件，以及如何在本项目中应用。

### 一、MongoDB查询基础

MongoDB查询条件是一个JSON文档，用于指定过滤条件。基本语法如下：

```python
query = {字段名: 值}
```

### 二、常见查询操作符

#### 1. 比较操作符

| 操作符 | 描述 | 示例 |
|-------|------|------|
| `$eq` | 等于 | `{"name": {"$eq": "Alice"}}` |
| `$ne` | 不等于 | `{"status": {"$ne": "inactive"}}` |
| `$gt` | 大于 | `{"age": {"$gt": 18}}` |
| `$gte` | 大于等于 | `{"score": {"$gte": 90}}` |
| `$lt` | 小于 | `{"price": {"$lt": 50}}` |
| `$lte` | 小于等于 | `{"quantity": {"$lte": 10}}` |

#### 2. 逻辑操作符

| 操作符 | 描述 | 示例 |
|-------|------|------|
| `$and` | 逻辑与 | `{"$and": [{"age": {"$gt": 18}}, {"status": "active"}]}` |
| `$or` | 逻辑或 | `{"$or": [{"status": "active"}, {"priority": "high"}]}` |
| `$not` | 逻辑非 | `{"age": {"$not": {"$gt": 18}}}` |
| `$nor` | 逻辑与非 | `{"$nor": [{"status": "inactive"}, {"priority": "low"}]}` |

#### 3. 数组操作符

| 操作符 | 描述 | 示例 |
|-------|------|------|
| `$in` | 在指定数组内 | `{"category": {"$in": ["electronics", "clothing"]}}` |
| `$nin` | 不在指定数组内 | `{"status": {"$nin": ["inactive", "deleted"]}}` |
| `$all` | 包含所有指定元素 | `{"tags": {"$all": ["python", "mongodb"]}}` |
| `$size` | 数组长度等于 | `{"comments": {"$size": 3}}` |

#### 4. 元素操作符

| 操作符 | 描述 | 示例 |
|-------|------|------|
| `$exists` | 字段存在 | `{"email": {"$exists": True}}` |
| `$type` | 字段类型匹配 | `{"age": {"$type": "int"}}` |

### 三、在项目中的应用示例

根据项目中的`mongodb.py`文件，我们可以为`get_collection_data`函数编写各种查询条件。以下是基于MongoDB示例数据集`sample_mflix`的实用查询示例：

#### 1. 基本查询

```python
# 查询所有评论
query = {}
results = get_collection_data('sample_mflix', 'comments', query=query, limit=5)

# 查询特定电影的评论
query = {"movie_id": "573a1390f29313caabcd4135"}
results = get_collection_data('sample_mflix', 'comments', query=query)

# 查询特定用户的评论
query = {"name": "Samwell Tarly"}
results = get_collection_data('sample_mflix', 'comments', query=query)
```

#### 2. 条件查询

```python
# 查询评分高于7的评论
query = {"rating": {"$gte": 7}}
results = get_collection_data('sample_mflix', 'comments', query=query, limit=10)

# 查询2020年之后的评论
query = {"date": {"$gte": "2020-01-01"}}
results = get_collection_data('sample_mflix', 'comments', query=query)

# 查询评论内容包含特定关键词的评论
query = {"text": {"$regex": "amazing", "$options": "i"}}  # 不区分大小写
results = get_collection_data('sample_mflix', 'comments', query=query)
```

#### 3. 组合查询

```python
# 查询评分高于8且2021年之后的评论
query = {
    "$and": [
        {"rating": {"$gte": 8}},
        {"date": {"$gte": "2021-01-01"}}
    ]
}
results = get_collection_data('sample_mflix', 'comments', query=query)

# 查询特定用户的评论或高评分评论
query = {
    "$or": [
        {"name": "Samwell Tarly"},
        {"rating": {"$gte": 9}}
    ]
}
results = get_collection_data('sample_mflix', 'comments', query=query)
```

#### 4. 使用排序和限制

```python
# 查询最新的10条评论
query = {}
sort = [("date", -1)]  # 按日期降序排列
results = get_collection_data('sample_mflix', 'comments', query=query, limit=10, sort=sort)

# 查询评分最高的5条评论
query = {"rating": {"$gte": 1}}
sort = [("rating", -1)]
results = get_collection_data('sample_mflix', 'comments', query=query, limit=5, sort=sort)
```

### 四、高级查询技巧

#### 1. 嵌套文档查询

如果文档中包含嵌套结构，可以使用点号表示法：

```python
# 假设文档结构: {"user": {"name": "John", "age": 30}}
query = {"user.age": {"$gte": 25}}
```

#### 2. 使用正则表达式

```python
# 查询名字以"S"开头的用户的评论
query = {"name": {"$regex": "^S"}}

# 查询文本中包含"excellent"或"amazing"的评论
query = {"text": {"$regex": "excellent|amazing", "$options": "i"}}
```

#### 3. 数组字段查询

```python
# 假设文档有一个tags数组字段
query = {"tags": "action"}  # 包含action标签的文档

# 查询同时包含多个标签的文档
query = {"tags": {"$all": ["action", "adventure"]}}
```

### 五、与with语句结合使用

在实际项目中，可以将MongoDB查询与with语句结合使用，确保资源正确管理：

```python
from pymongo.mongo_client import MongoClient
from contextlib import contextmanager

@contextmanager
def get_mongo_connection(uri):
    """创建MongoDB连接的上下文管理器"""
    client = MongoClient(uri)
    try:
        yield client
    finally:
        client.close()

# 使用示例
with get_mongo_connection("mongodb+srv://nan_admin:nan_admin@nanmongodb.smmoxzz.mongodb.net/") as client:
    db = client['sample_mflix']
    # 执行查询
    query = {"rating": {"$gte": 8}}
    comments = db['comments'].find(query).limit(10)
    for comment in comments:
        print(comment['text'])
```

通过这些示例和技巧，您可以灵活地编写MongoDB查询条件，从集合中检索所需的数据。在实际应用中，可以根据具体的数据结构和查询需求，组合使用各种查询操作符，构建复杂的查询条件。

---

## Python @property装饰器详解与实战指南

### 目录
1. [@property是什么](#property是什么)
2. [基本语法与使用](#基本语法与使用)
3. [工作原理深度解析](#工作原理深度解析)
4. [实际应用场景](#实际应用场景)
5. [高级特性与技巧](#高级特性与技巧)
6. [常见错误与最佳实践](#常见错误与最佳实践)
7. [综合实战案例](#综合实战案例)

### @property是什么

`@property`是Python中的一个内置装饰器，用于将类的方法转换为**属性访问**，实现getter、setter和deleter功能。它是Python属性管理的核心机制，提供了优雅的属性访问控制方式。

#### 核心优势
- **封装性**：隐藏实现细节，提供统一接口
- **数据验证**：在设置属性时进行数据校验
- **计算属性**：动态计算属性值而非存储
- **向后兼容**：可以在不破坏现有代码的情况下添加验证逻辑

### 基本语法与使用

#### 1. 基本getter属性
```python
class Person:
    def __init__(self, name, age):
        self._name = name  # 使用单下划线表示受保护属性
        self._age = age
    
    @property
    def name(self):
        """获取姓名"""
        return self._name.title()  # 返回格式化后的姓名
    
    @property
    def age(self):
        """获取年龄"""
        return self._age

# 使用示例
person = Person("alice smith", 25)
print(person.name)  # 输出: Alice Smith
print(person.age)   # 输出: 25
# 注意：这里像访问属性一样访问方法，不需要加括号
```

#### 2. 添加setter方法
```python
class Person:
    def __init__(self, name, age):
        self._name = name
        self._age = age
    
    @property
    def age(self):
        """获取年龄"""
        return self._age
    
    @age.setter
    def age(self, value):
        """设置年龄，包含验证逻辑"""
        if not isinstance(value, int):
            raise TypeError("年龄必须是整数")
        if value < 0 or value > 150:
            raise ValueError("年龄必须在0-150之间")
        self._age = value
    
    @property
    def name(self):
        """获取姓名"""
        return self._name
    
    @name.setter
    def name(self, value):
        """设置姓名，包含验证逻辑"""
        if not isinstance(value, str):
            raise TypeError("姓名必须是字符串")
        if len(value.strip()) == 0:
            raise ValueError("姓名不能为空")
        self._name = value.strip()

# 使用示例
person = Person("Alice", 25)
person.age = 30  # 正常设置
person.name = "Bob Johnson"  # 正常设置

# person.age = -5  # 触发ValueError
# person.name = ""  # 触发ValueError
```

#### 3. 添加deleter方法
```python
class Person:
    def __init__(self, name):
        self._name = name
    
    @property
    def name(self):
        """获取姓名"""
        return self._name
    
    @name.deleter
    def name(self):
        """删除姓名"""
        print("删除姓名属性")
        del self._name

# 使用示例
person = Person("Alice")
print(person.name)  # 输出: Alice
del person.name     # 触发deleter，输出: 删除姓名属性
# print(person.name)  # 触发AttributeError
```

### 工作原理深度解析

#### 属性描述符机制
`@property`实际上是创建了一个**属性描述符**对象，它实现了`__get__`、`__set__`和`__delete__`方法。

```python
# 手动创建property的等价形式
class Person:
    def __init__(self, age):
        self._age = age
    
    def get_age(self):
        return self._age
    
    def set_age(self, value):
        if value < 0:
            raise ValueError("年龄不能为负数")
        self._age = value
    
    def del_age(self):
        del self._age
    
    # 手动创建property对象
    age = property(get_age, set_age, del_age, "年龄属性")

# 使用装饰器的方式更简洁，但底层机制相同
class Person:
    def __init__(self, age):
        self._age = age
    
    @property
    def age(self):
        """年龄属性"""
        return self._age
    
    @age.setter
    def age(self, value):
        if value < 0:
            raise ValueError("年龄不能为负数")
        self._age = value
```

#### 访问流程分析
```python
person = Person(25)

# 当执行 person.age 时：
# 1. Python发现age是一个property对象
# 2. 调用property.__get__(person, Person)
# 3. property对象调用我们定义的getter方法
# 4. 返回getter方法的结果

# 当执行 person.age = 30 时：
# 1. Python发现age是一个property对象
# 2. 调用property.__set__(person, 30)
# 3. property对象调用我们定义的setter方法
# 4. 在setter方法中进行验证和赋值
```

### 实际应用场景

#### 1. 数据验证与清洗
```python
class EmailValidator:
    """邮箱验证器"""
    
    def __init__(self):
        self._email = None
    
    @property
    def email(self):
        """获取邮箱地址"""
        return self._email
    
    @email.setter
    def email(self, value):
        """设置邮箱地址，包含格式验证"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not isinstance(value, str):
            raise TypeError("邮箱必须是字符串")
        
        if not re.match(pattern, value):
            raise ValueError("无效的邮箱格式")
        
        self._email = value.lower()

# 使用示例
validator = EmailValidator()
validator.email = "user@example.com"  # 正常
# validator.email = "invalid-email"  # 触发ValueError
```

#### 2. 计算属性
```python
class Circle:
    """圆形类，展示计算属性的使用"""
    
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        """半径"""
        return self._radius
    
    @radius.setter
    def radius(self, value):
        if value <= 0:
            raise ValueError("半径必须为正数")
        self._radius = value
    
    @property
    def diameter(self):
        """直径（只读属性）"""
        return self._radius * 2
    
    @property
    def area(self):
        """面积（计算属性）"""
        import math
        return math.pi * self._radius ** 2
    
    @property
    def circumference(self):
        """周长（计算属性）"""
        import math
        return 2 * math.pi * self._radius

# 使用示例
circle = Circle(5)
print(f"半径: {circle.radius}")          # 输出: 半径: 5
print(f"直径: {circle.diameter}")        # 输出: 直径: 10
print(f"面积: {circle.area:.2f}")       # 输出: 面积: 78.54
print(f"周长: {circle.circumference:.2f}")  # 输出: 周长: 31.42

circle.radius = 10  # 修改半径，所有计算属性自动更新
print(f"新面积: {circle.area:.2f}")    # 输出: 新面积: 314.16
```

#### 3. 延迟加载与缓存
```python
class DataProcessor:
    """数据处理器，展示延迟加载和缓存"""
    
    def __init__(self, data_source):
        self._data_source = data_source
        self._processed_data = None
        self._cache_valid = False
    
    @property
    def processed_data(self):
        """获取处理后的数据，带缓存机制"""
        if not self._cache_valid:
            print("处理数据中...")
            self._processed_data = self._expensive_processing()
            self._cache_valid = True
        else:
            print("使用缓存数据...")
        return self._processed_data
    
    def _expensive_processing(self):
        """模拟耗时的数据处理"""
        import time
        time.sleep(1)  # 模拟耗时操作
        return f"处理后的数据来自 {self._data_source}"
    
    def invalidate_cache(self):
        """使缓存失效"""
        self._cache_valid = False

# 使用示例
processor = DataProcessor("数据库")
print(processor.processed_data)  # 第一次：处理数据中...
print(processor.processed_data)  # 第二次：使用缓存数据...
processor.invalidate_cache()
print(processor.processed_data)  # 重新处理数据
```

#### 4. 属性访问控制
```python
class BankAccount:
    """银行账户类，展示属性访问控制"""
    
    def __init__(self, balance=0):
        self._balance = balance
    
    @property
    def balance(self):
        """获取余额（只读）"""
        return self._balance
    
    def deposit(self, amount):
        """存款"""
        if amount <= 0:
            raise ValueError("存款金额必须为正数")
        self._balance += amount
    
    def withdraw(self, amount):
        """取款"""
        if amount <= 0:
            raise ValueError("取款金额必须为正数")
        if amount > self._balance:
            raise ValueError("余额不足")
        self._balance -= amount
    
    @property
    def is_overdrawn(self):
        """是否透支（计算属性）"""
        return self._balance < 0

# 使用示例
account = BankAccount(1000)
print(f"余额: {account.balance}")  # 输出: 余额: 1000
account.deposit(500)
print(f"新余额: {account.balance}")  # 输出: 新余额: 1500
# account.balance = 2000  # 触发AttributeError: can't set attribute
```

### 高级特性与技巧

#### 1. 属性链式调用
```python
class Address:
    def __init__(self, street, city, country):
        self._street = street
        self._city = city
        self._country = country
    
    @property
    def street(self):
        return self._street
    
    @street.setter
    def street(self, value):
        self._street = value
    
    @property
    def city(self):
        return self._city
    
    @city.setter
    def city(self, value):
        self._city = value
    
    @property
    def country(self):
        return self._country
    
    @country.setter
    def country(self, value):
        self._country = value
    
    @property
    def full_address(self):
        """完整地址"""
        return f"{self._street}, {self._city}, {self._country}"

class Person:
    def __init__(self, name, address):
        self.name = name
        self._address = address
    
    @property
    def address(self):
        """地址对象"""
        return self._address
    
    @property
    def location(self):
        """位置信息（通过地址对象链式访问）"""
        return self._address.full_address

# 使用示例
address = Address("123 Main St", "New York", "USA")
person = Person("Alice", address)
print(person.location)  # 输出: 123 Main St, New York, USA
```

#### 2. 动态属性创建
```python
class DynamicProperties:
    """动态属性创建示例"""
    
    def __init__(self):
        self._properties = {}
    
    def add_property(self, name, default_value=None):
        """动态添加属性"""
        private_name = f"_{name}"
        self._properties[name] = default_value
        
        # 创建getter
        def getter(self):
            return getattr(self, private_name, default_value)
        
        # 创建setter
        def setter(self, value):
            setattr(self, private_name, value)
        
        # 创建property并绑定到类
        setattr(self.__class__, name, property(getter, setter))

# 使用示例（注意：实际应用中需要更完善的实现）
obj = DynamicProperties()
obj.add_property("dynamic_attr", "default")
print(obj.dynamic_attr)  # 输出: default
obj.dynamic_attr = "new value"
print(obj.dynamic_attr)  # 输出: new value
```

#### 3. 属性继承与重写
```python
class BaseConfig:
    """基础配置类"""
    
    def __init__(self):
        self._debug = False
    
    @property
    def debug(self):
        """调试模式"""
        return self._debug
    
    @debug.setter
    def debug(self, value):
        self._debug = bool(value)

class DevelopmentConfig(BaseConfig):
    """开发环境配置"""
    
    def __init__(self):
        super().__init__()
        self._debug = True  # 开发环境默认开启调试
    
    @property
    def database_url(self):
        """数据库URL（子类新增属性）"""
        return "sqlite:///dev.db"

class ProductionConfig(BaseConfig):
    """生产环境配置"""
    
    @BaseConfig.debug.getter
    def debug(self):
        """重写debug属性的getter，生产环境强制关闭调试"""
        return False
    
    @debug.setter
    def debug(self, value):
        """重写debug属性的setter，生产环境不允许设置debug"""
        if value:
            raise ValueError("生产环境不能开启调试模式")
        self._debug = False

# 使用示例
dev_config = DevelopmentConfig()
print(dev_config.debug)  # 输出: True

prod_config = ProductionConfig()
print(prod_config.debug)  # 输出: False
# prod_config.debug = True  # 触发ValueError
```

### 常见错误与最佳实践

#### 1. 常见错误
```python
# 错误1：在setter中无限递归
class BadExample:
    def __init__(self):
        self._value = 0
    
    @property
    def value(self):
        return self._value
    
    @value.setter
    def value(self, val):
        # 错误：会导致无限递归
        # self.value = val  # 这会再次调用setter
        
        # 正确做法：使用私有变量
        self._value = val

# 错误2：忘记返回self
class BadExample2:
    @property
    def name(self):
        # 错误：应该返回实际的值
        print("Getting name")
        # 缺少 return self._name
```

#### 2. 最佳实践
```python
class BestPractices:
    """@property最佳实践示例"""
    
    def __init__(self, value):
        self._value = None
        self.value = value  # 使用setter进行初始化验证
    
    @property
    def value(self):
        """获取值
        
        Returns:
            当前存储的值
        """
        return self._value
    
    @value.setter
    def value(self, val):
        """设置值，包含验证
        
        Args:
            val: 要设置的值
            
        Raises:
            ValueError: 当值无效时
        """
        if val is None:
            raise ValueError("值不能为None")
        self._value = val
    
    @classmethod
    def from_string(cls, value_str):
        """类方法：从字符串创建实例"""
        return cls(int(value_str))
    
    @staticmethod
    def validate_format(value):
        """静态方法：验证值格式"""
        return isinstance(value, (int, float))

# 使用示例
try:
    bp = BestPractices(10)
    bp.value = 20  # 正常设置
    print(bp.value)  # 输出: 20
except ValueError as e:
    print(f"错误: {e}")
```

### 综合实战案例

#### 案例1：温度转换器
```python
class TemperatureConverter:
    """温度转换器，支持摄氏度、华氏度和开尔文"""
    
    def __init__(self, celsius=0):
        self.celsius = celsius
    
    @property
    def celsius(self):
        """摄氏度"""
        return self._celsius
    
    @celsius.setter
    def celsius(self, value):
        self._celsius = float(value)
    
    @property
    def fahrenheit(self):
        """华氏度（计算属性）"""
        return (self._celsius * 9/5) + 32
    
    @fahrenheit.setter
    def fahrenheit(self, value):
        self._celsius = (float(value) - 32) * 5/9
    
    @property
    def kelvin(self):
        """开尔文（计算属性）"""
        return self._celsius + 273.15
    
    @kelvin.setter
    def kelvin(self, value):
        self._celsius = float(value) - 273.15
    
    def __str__(self):
        return f"{self.celsius}°C = {self.fahrenheit}°F = {self.kelvin}K"

# 使用示例
temp = TemperatureConverter(25)
print(temp)  # 输出: 25.0°C = 77.0°F = 298.15K

temp.fahrenheit = 100
print(temp.celsius)  # 输出: 37.77777777777778

temp.kelvin = 0
print(temp.celsius)  # 输出: -273.15
```

#### 案例2：数据库模型
```python
class UserModel:
    """用户模型，展示@property在ORM中的应用"""
    
    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password = password  # 这里会自动哈希密码
        self._created_at = None
    
    @property
    def username(self):
        """用户名"""
        return self._username
    
    @username.setter
    def username(self, value):
        if not value or len(value) < 3:
            raise ValueError("用户名至少3个字符")
        if not value.isalnum():
            raise ValueError("用户名只能包含字母和数字")
        self._username = value.lower()
    
    @property
    def email(self):
        """邮箱地址"""
        return self._email
    
    @email.setter
    def email(self, value):
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, value):
            raise ValueError("无效的邮箱格式")
        self._email = value.lower()
    
    @property
    def password(self):
        """密码（只写属性）"""
        raise AttributeError("密码是只写属性")
    
    @password.setter
    def password(self, value):
        """设置密码（自动哈希）"""
        if len(value) < 8:
            raise ValueError("密码至少8个字符")
        self._password_hash = self._hash_password(value)
    
    def _hash_password(self, password):
        """密码哈希（简化版）"""
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()
    
    def check_password(self, password):
        """验证密码"""
        return self._hash_password(password) == self._password_hash
    
    @property
    def display_name(self):
        """显示名称（计算属性）"""
        return self.username.capitalize()
    
    def to_dict(self):
        """转换为字典"""
        return {
            'username': self.username,
            'email': self.email,
            'display_name': self.display_name
        }

# 使用示例
try:
    user = UserModel("alice123", "alice@example.com", "securepassword123")
    print(user.display_name)  # 输出: Alice123
    print(user.to_dict())
    
    # user.password  # 触发AttributeError
    print(user.check_password("securepassword123"))  # 输出: True
    
except ValueError as e:
    print(f"创建用户失败: {e}")
```

### 总结

`@property`装饰器是Python中实现属性封装和数据验证的强大工具。通过合理使用@property，可以：

1. **提高代码质量**：通过封装隐藏实现细节
2. **增强数据安全性**：在属性设置时进行验证
3. **提升代码可读性**：提供直观的属性访问接口
4. **支持动态计算**：实现计算属性而非存储值
5. **保持向后兼容**：可以在不影响现有代码的情况下添加验证逻辑

在实际开发中，应该合理使用@property来管理类的属性，特别是在需要数据验证、计算属性或延迟加载的场景中。记住，好的@property使用应该让代码更简洁、更安全、更易维护。