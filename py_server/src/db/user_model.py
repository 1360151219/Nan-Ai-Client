"""
用户模型和数据库操作模块
用于管理用户信息和会话历史
"""

from pymongo.errors import PyMongoError, DuplicateKeyError
from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime
from typing import List, Dict, Optional
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

# 获取MongoDB连接URI
MONGODB_URI = os.getenv("MONGODB_URI")


class UserModel:
    """
    用户模型类，用于管理用户数据和会话历史
    """

    def __init__(self):
        """初始化用户模型，建立数据库连接"""
        self.client = MongoClient(MONGODB_URI)
        self.db = self.client.get_database("nan_agent_main")

        self.users_collection = self.db["users"]
        if self.users_collection is None:
            self.db.create_collection("users")
        self._create_indexes()

    def _create_indexes(self):
        """创建必要的索引以优化查询性能"""
        try:
            # 为用户ID创建唯一索引
            self.users_collection.create_index("user_id", unique=True)
            # 为会话ID数组创建索引，便于查询
            self.users_collection.create_index("session_ids")
            # 为创建时间创建索引，便于按时间排序
            self.users_collection.create_index([("created_at", DESCENDING)])
            print("用户集合索引创建成功")
        except Exception as e:
            print(f"创建索引时出错: {e}")

    def create_user(
        self,
        user_id: str,
        username: str = None,
        email: str = None,
        metadata: Dict = None,
    ) -> bool:
        """
        创建新用户

        Args:
            user_id: 用户唯一标识符
            username: 用户名（可选）
            email: 用户邮箱（可选）
            metadata: 用户元数据（可选）

        Returns:
            bool: 创建是否成功
        """
        try:
            user_data = {
                "user_id": user_id,
                "username": username or user_id,
                "email": email,
                "session_ids": [],  # 存储会话ID的数组
                "session_count": 0,  # 会话总数
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "last_active": datetime.utcnow(),
                "metadata": metadata or {},
            }

            result = self.users_collection.insert_one(user_data)
            print(f"用户 '{user_id}' 创建成功，文档ID: {result.inserted_id}")
            return True

        except DuplicateKeyError:
            print(f"用户 '{user_id}' 已存在")
            return False
        except PyMongoError as e:
            print(f"创建用户时出错: {e}")
            return False
        except Exception as e:
            print(f"未知错误: {e}")
            return False

    def add_session_to_user(self, user_id: str, session_id: str, agent_id: Optional[str] = None) -> bool:
        """
        为用户添加新的会话ID

        Args:
            user_id: 用户ID
            session_id: 会话ID
            agent_id: 智能体ID（可选）

        Returns:
            bool: 操作是否成功
        """
        try:
            # 使用addToSet避免重复添加相同的session_id
            result = self.users_collection.update_one(
                {"user_id": user_id},
                {
                    "$addToSet": {
                        "session_ids": {
                            "id": session_id,
                            "agent_id": agent_id if agent_id else "main_agent",
                        }
                    },
                    "$inc": {"session_count": 1},
                    "$set": {
                        "updated_at": datetime.utcnow(),
                        "last_active": datetime.utcnow(),
                    },
                },
            )

            if result.modified_count > 0:
                print(f"为用户 '{user_id}' 添加会话ID '{session_id}' 成功")
                return True
            else:
                print(f"用户 '{user_id}' 不存在")
                return False

        except PyMongoError as e:
            print(f"添加会话ID时出错: {e}")
            return False
        except Exception as e:
            print(f"未知错误: {e}")
            return False

    def get_user_sessions(self, user_id: str, limit: int = None) -> List[str]:
        """
        获取用户的所有会话ID

        Args:
            user_id: 用户ID
            limit: 返回的会话数量限制（可选）

        Returns:
            List[str]: 会话ID列表
        """
        try:
            user = self.users_collection.find_one(
                {"user_id": user_id}, {"session_ids": 1, "session_count": 1}
            )

            if user:
                session_ids = user.get("session_ids", [])
                if limit and len(session_ids) > limit:
                    return session_ids[-limit:]  # 返回最新的会话ID
                return session_ids
            else:
                print(f"用户 '{user_id}' 不存在")
                return []

        except PyMongoError as e:
            print(f"查询用户会话时出错: {e}")
            return []
        except Exception as e:
            print(f"未知错误: {e}")
            return []

    def get_user_info(self, user_id: str) -> Optional[Dict]:
        """
        获取用户的完整信息

        Args:
            user_id: 用户ID

        Returns:
            Optional[Dict]: 用户信息字典，如果不存在则返回None
        """
        try:
            user = self.users_collection.find_one({"user_id": user_id})
            if user:
                # 转换ObjectId为字符串，便于JSON序列化
                user["_id"] = str(user["_id"])
                return user
            else:
                return None

        except PyMongoError as e:
            print(f"查询用户信息时出错: {e}")
            return None
        except Exception as e:
            print(f"未知错误: {e}")
            return None

    def update_user_metadata(self, user_id: str, metadata: Dict) -> bool:
        """
        更新用户的元数据

        Args:
            user_id: 用户ID
            metadata: 要更新的元数据

        Returns:
            bool: 更新是否成功
        """
        try:
            result = self.users_collection.update_one(
                {"user_id": user_id},
                {"$set": {"metadata": metadata, "updated_at": datetime.utcnow()}},
            )

            if result.modified_count > 0:
                print(f"用户 '{user_id}' 元数据更新成功")
                return True
            else:
                print(f"用户 '{user_id}' 不存在")
                return False

        except PyMongoError as e:
            print(f"更新用户元数据时出错: {e}")
            return False
        except Exception as e:
            print(f"未知错误: {e}")
            return False

    def get_active_users(self, days: int = 30, limit: int = 10) -> List[Dict]:
        """
        获取最近活跃的用户列表

        Args:
            days: 活跃天数范围（默认30天）
            limit: 返回的用户数量限制

        Returns:
            List[Dict]: 活跃用户列表
        """
        try:
            from datetime import timedelta

            cutoff_date = datetime.utcnow() - timedelta(days=days)

            users = (
                self.users_collection.find(
                    {"last_active": {"$gte": cutoff_date}},
                    {"user_id": 1, "username": 1, "last_active": 1, "session_count": 1},
                )
                .sort("last_active", DESCENDING)
                .limit(limit)
            )

            result = []
            for user in users:
                user["_id"] = str(user["_id"])
                result.append(user)

            return result

        except PyMongoError as e:
            print(f"查询活跃用户时出错: {e}")
            return []
        except Exception as e:
            print(f"未知错误: {e}")
            return []

    def delete_user(self, user_id: str) -> bool:
        """
        删除用户（谨慎使用）

        Args:
            user_id: 用户ID

        Returns:
            bool: 删除是否成功
        """
        try:
            result = self.users_collection.delete_one({"user_id": user_id})

            if result.deleted_count > 0:
                print(f"用户 '{user_id}' 删除成功")
                return True
            else:
                print(f"用户 '{user_id}' 不存在")
                return False

        except PyMongoError as e:
            print(f"删除用户时出错: {e}")
            return False
        except Exception as e:
            print(f"未知错误: {e}")
            return False

    def close_connection(self):
        """关闭数据库连接"""
        try:
            self.client.close()
            print("数据库连接已关闭")
        except Exception as e:
            print(f"关闭连接时出错: {e}")


# 使用示例和测试函数
def test_user_model():
    """测试用户模型功能"""
    user_model = UserModel()

    try:
        # 测试创建用户
        user_id = "test_user_001"
        username = "测试用户"
        email = "test@example.com"

        print("=== 创建用户 ===")
        success = user_model.create_user(
            user_id=user_id,
            username=username,
            email=email,
            metadata={"source": "test", "plan": "premium"},
        )

        if success:
            # 测试添加会话
            print("\n=== 添加会话 ===")
            session_ids = ["session_001", "session_002", "session_003"]
            for session_id in session_ids:
                user_model.add_session_to_user(user_id, session_id)

            # 测试获取用户信息
            print("\n=== 获取用户信息 ===")
            user_info = user_model.get_user_info(user_id)
            if user_info:
                print(f"用户ID: {user_info['user_id']}")
                print(f"用户名: {user_info['username']}")
                print(f"会话数量: {user_info['session_count']}")
                print(f"会话ID列表: {user_info['session_ids']}")
                print(f"创建时间: {user_info['created_at']}")

            # 测试获取用户会话
            print("\n=== 获取用户会话 ===")
            sessions = user_model.get_user_sessions(user_id)
            print(f"用户会话ID: {sessions}")

            # 测试更新元数据
            print("\n=== 更新用户元数据 ===")
            new_metadata = {"source": "test", "plan": "premium", "language": "zh-CN"}
            user_model.update_user_metadata(user_id, new_metadata)

            # 验证更新
            updated_user = user_model.get_user_info(user_id)
            print(f"更新后的元数据: {updated_user['metadata']}")

            # 测试获取活跃用户
            print("\n=== 获取活跃用户 ===")
            active_users = user_model.get_active_users(days=1, limit=5)
            print(f"活跃用户数量: {len(active_users)}")
            for user in active_users:
                print(f"- {user['user_id']}: {user['username']}")

        print("\n=== 测试完成 ===")

    except Exception as e:
        print(f"测试过程中出错: {e}")
    finally:
        # 清理测试数据（可选）
        # user_model.delete_user(user_id)
        user_model.close_connection()


if __name__ == "__main__":
    user_model = UserModel()
    user_model.create_user(
        user_id="root",
        username="root",
    )
