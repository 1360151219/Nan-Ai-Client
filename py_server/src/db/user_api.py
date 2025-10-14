"""
用户管理API接口
提供RESTful API来管理用户和会话
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from .user_model import UserModel

# 创建路由器
router = APIRouter(prefix="/api/users", tags=["users"])

# 初始化用户模型
user_model = UserModel()


# Pydantic模型用于请求验证
class CreateUserRequest(BaseModel):
    """创建用户请求模型"""
    user_id: str
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    metadata: Optional[Dict] = None


class AddSessionRequest(BaseModel):
    """添加会话请求模型"""
    session_id: str


class UpdateMetadataRequest(BaseModel):
    """更新元数据请求模型"""
    metadata: Dict


class UserResponse(BaseModel):
    """用户响应模型"""
    user_id: str
    username: str
    email: Optional[str] = None
    session_ids: List[str]
    session_count: int
    created_at: datetime
    updated_at: datetime
    last_active: datetime
    metadata: Dict


class SessionResponse(BaseModel):
    """会话响应模型"""
    user_id: str
    session_ids: List[str]
    session_count: int


# API路由
@router.post("/", response_model=Dict, status_code=status.HTTP_201_CREATED)
async def create_user(request: CreateUserRequest):
    """
    创建新用户
    
    Returns:
        包含创建状态和用户信息的对象
    """
    try:
        success = user_model.create_user(
            user_id=request.user_id,
            username=request.username,
            email=request.email,
            metadata=request.metadata
        )
        
        if success:
            user_info = user_model.get_user_info(request.user_id)
            return {
                "success": True,
                "message": "用户创建成功",
                "data": user_info
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="用户已存在"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建用户失败: {str(e)}"
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """
    获取用户信息
    
    Args:
        user_id: 用户ID
        
    Returns:
        用户信息
    """
    user_info = user_model.get_user_info(user_id)
    
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return UserResponse(**user_info)


@router.post("/{user_id}/sessions", response_model=Dict)
async def add_session_to_user(user_id: str, request: AddSessionRequest):
    """
    为用户添加会话ID
    
    Args:
        user_id: 用户ID
        request: 包含会话ID的请求
        
    Returns:
        操作结果
    """
    success = user_model.add_session_to_user(user_id, request.session_id)
    
    if success:
        return {
            "success": True,
            "message": "会话添加成功"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )


@router.get("/{user_id}/sessions", response_model=SessionResponse)
async def get_user_sessions(user_id: str, limit: Optional[int] = None):
    """
    获取用户的所有会话ID
    
    Args:
        user_id: 用户ID
        limit: 返回的会话数量限制
        
    Returns:
        会话信息
    """
    session_ids = user_model.get_user_sessions(user_id, limit)
    
    if session_ids is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return SessionResponse(
        user_id=user_id,
        session_ids=session_ids,
        session_count=len(session_ids)
    )


@router.put("/{user_id}/metadata", response_model=Dict)
async def update_user_metadata(user_id: str, request: UpdateMetadataRequest):
    """
    更新用户元数据
    
    Args:
        user_id: 用户ID
        request: 包含新元数据的请求
        
    Returns:
        操作结果
    """
    success = user_model.update_user_metadata(user_id, request.metadata)
    
    if success:
        return {
            "success": True,
            "message": "元数据更新成功"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )


@router.get("/active/recent", response_model=List[Dict])
async def get_active_users(days: int = 30, limit: int = 10):
    """
    获取最近活跃的用户列表
    
    Args:
        days: 活跃天数范围（默认30天）
        limit: 返回的用户数量限制
        
    Returns:
        活跃用户列表
    """
    active_users = user_model.get_active_users(days, limit)
    return active_users


@router.delete("/{user_id}", response_model=Dict)
async def delete_user(user_id: str):
    """
    删除用户（谨慎使用）
    
    Args:
        user_id: 用户ID
        
    Returns:
        操作结果
    """
    success = user_model.delete_user(user_id)
    
    if success:
        return {
            "success": True,
            "message": "用户删除成功"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )


# 在应用关闭时清理资源
@router.on_event("shutdown")
async def shutdown_event():
    """应用关闭时的清理操作"""
    user_model.close_connection()


# 集成到主应用的示例
"""
# 在主应用文件中添加以下代码来集成用户管理API

from fastapi import FastAPI
from src.db.user_api import router as user_router

app = FastAPI()

# 注册用户管理路由
app.include_router(user_router)

# 现在可以通过以下API端点访问用户管理功能：
# POST /api/users/ - 创建用户
# GET /api/users/{user_id} - 获取用户信息
# POST /api/users/{user_id}/sessions - 添加会话
# GET /api/users/{user_id}/sessions - 获取用户会话
# PUT /api/users/{user_id}/metadata - 更新元数据
# GET /api/users/active/recent - 获取活跃用户
# DELETE /api/users/{user_id} - 删除用户
"""