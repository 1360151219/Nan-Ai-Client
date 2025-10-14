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


def insertSessionId(user_id: str, session_id: str):
    """
    插入会话ID到数据库（兼容旧版本）
    推荐使用新的UserModel类进行用户会话管理

    Args:
        user_id: 用户ID
        session_id: 会话ID
    """
    try:
        # 获取数据库和集合
        db = client.get_database("main")
        collection = db["sessions"]

        # 插入文档（兼容旧格式）
        collection.insert_one({"session_id": session_id})

        print(f"会话ID '{session_id}' 插入成功")
        
        # 同时更新到用户模型（如果存在）
        try:
            from .user_model import UserModel
            user_model = UserModel()
            user_model.add_session_to_user(user_id, session_id)
            user_model.close_connection()
            print(f"会话ID '{session_id}' 已关联到用户 '{user_id}'")
        except Exception as e:
            print(f"更新用户会话记录时出错: {e}")

    except PyMongoError as e:
        print(f"插入会话ID时出错: {e}")
    except Exception as e:
        print(f"未知错误: {e}")