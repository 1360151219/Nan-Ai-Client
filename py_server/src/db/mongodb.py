from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import CollectionInvalid
from pymongo.errors import PyMongoError
from bson.json_util import dumps
from dotenv import load_dotenv

load_dotenv()
import os

uri = os.getenv("MONGODB_URI")
# uri = "mongodb://localhost:27017/?directConnection=true"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi("1"))


def create_collection(database_name, collection_name):
    """
    在指定数据库中创建一个新的集合(相当于表)

    Args:
        database_name: 数据库名称
        collection_name: 集合名称

    Returns:
        bool: 创建是否成功
    """
    try:
        # 获取或创建数据库
        db = client.get_database(database_name)

        # 创建集合
        db.create_collection(collection_name)

        print(f"集合 '{collection_name}' 在数据库 '{database_name}' 中创建成功")
        return True
    except CollectionInvalid:
        print(f"集合 '{collection_name}' 已存在")
        return False
    except Exception as e:
        print(f"创建集合时出错: {e}")
        return False


def get_collection_data(
    database_name, collection_name, query=None, limit=10, sort=None
):
    """
    查看指定集合中的数据

    Args:
        database_name: 数据库名称
        collection_name: 集合名称
        query: 查询条件，默认为None(查询所有)
        limit: 返回的文档数量限制，默认为10
        sort: 排序条件，格式为[(字段名, 排序方向)]，排序方向1为升序，-1为降序

    Returns:
        list: 包含查询结果的文档列表
    """
    try:
        # 获取数据库和集合
        db = client.get_database(database_name)
        collection = db[collection_name]

        # 构建查询
        cursor = collection.find(query or {})

        # 应用排序(如果有)
        if sort:
            cursor = cursor.sort(sort)

        # 限制返回数量
        cursor = cursor.limit(limit)

        # 将游标转换为列表
        results = list(cursor)

        # 打印结果数量
        print(f"集合 '{collection_name}' 中找到 {len(results)} 条记录")

        # 打印结果(如果需要)
        if results:
            print("查询结果:")
            for document in results:
                # 使用bson.json_util.dumps格式化输出，更易读
                print(dumps(document, ensure_ascii=False, indent=2))

        return results

    except PyMongoError as e:
        print(f"查询集合数据时出错: {e}")
        return []
    except Exception as e:
        print(f"未知错误: {e}")
        return []


# 测试连接并展示当前数据库和集合
try:
    # 获取数据库
    # local_db = client.get_database("sample_mflix")
    local_db = client.sample_mflix

    # 发送ping确认连接成功
    client.admin.command("ping")
    print("MongoDB连接成功!")

    get_collection_data("sample_mflix", "comments")

    # 示例2: 查看集合中的所有数据(限制返回10条)
    # get_collection_data('main', 'test')

    # 示例3: 使用查询条件
    # query = {"age": {"$gte": 18}}  # 查询age大于等于18的文档
    # get_collection_data('main', 'test', query=query)

    # 示例4: 限制返回数量和排序
    # sort = [("created_at", -1)]  # 按created_at字段降序排序
    # get_collection_data('main', 'test', limit=5, sort=sort)

except Exception as e:
    print(f"MongoDB连接错误: {e}")
