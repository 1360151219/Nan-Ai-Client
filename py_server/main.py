import os
import uuid
from textwrap import indent
from typing import Optional
from fastapi.responses import StreamingResponse
from fastapi.routing import json
from langgraph.checkpoint.mongodb.aio import AsyncMongoDBSaver
from langchain_core.messages import BaseMessage, HumanMessage, message_chunk_to_message
from pydantic import BaseModel
from src.agents.run_agent import run_agent, run_agent_api
from src.agents.researcher import researcher
from src.coze.rag import list_datasets
from src.graph.builder import build_graph

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from src.utils import to_printable

app = FastAPI()

# 配置 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境建议指定具体域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有请求头
)

graph = build_graph()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


# 不再需要独立的chat_histories，使用LangGraph的checkpointer来管理会话记忆


@app.get("/api/datasets/list")
def list_all_datasets():
    """List all datasets."""
    datasets = list_datasets()
    # 将每个 dataset 对象转换为字典，以便进行 JSON 序列化
    datasets_json = [dataset.model_dump() for dataset in datasets]
    return json.dumps(datasets_json, indent=2)


@app.post("/api/chat")
async def chat_with_llm(chat_request: ChatRequest):
    """
    Handles a chat request with the language model, supporting streaming responses.

    This endpoint receives a message from the client, sends it to the LangGraph-based
    chatbot, and streams the response back to the client using Server-Sent Events (SSE).
    It leverages asynchronous programming to handle the streaming efficiently.
    """

    checkpoint_url = os.getenv("MONGODB_URI")
    message = chat_request.message
    session_id = chat_request.session_id or str(uuid.uuid4())

    if not message:
        return json.dumps({"error": "Message not provided"}), 400

    async def event_stream():
        """An async generator function to stream responses."""
        async with AsyncMongoDBSaver.from_conn_string(checkpoint_url) as checkpointer:
            graph.checkpointer = checkpointer
            # 使用会话ID作为thread_id来关联LangGraph的记忆
            config = {"configurable": {"thread_id": session_id}}

            # 获取历史状态或创建新的初始状态
            init_state = {"messages": [HumanMessage(content=message)], "todos": []}
            # The `stream` method returns a generator of events as they occur.
            # 使用config参数来启用记忆功能
            async for event, chunk in graph.astream(
                input=init_state, config=config, stream_mode=["messages", "updates"]
            ):
                langgraph_node = None
                if event == "messages":
                    message_chunk, metadata = chunk
                    base_message = message_chunk_to_message(message_chunk)
                    # for k, v in base_message:
                    # print(k, v, getattr(base_message, k, v))
                    langgraph_node = metadata.get("langgraph_node")
                    data_to_send = {
                        "session_id": session_id,
                        "type": "message",
                        "content": message_chunk.content,
                        "send_type": getattr(base_message, "type", None),
                    }
                    yield f"data: {json.dumps(data_to_send, ensure_ascii=False)}\n\n"
                if event == "updates" and langgraph_node:
                    state = chunk[langgraph_node]

            yield f"data: {json.dumps({'type': 'message_done'})}\n\n"

    # Return a streaming response.
    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/api/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """
    Retrieves the chat history for a given session ID using LangGraph的记忆功能.
    """
    checkpoint_url = os.getenv("MONGODB_URI")

    try:
        async with AsyncMongoDBSaver.from_conn_string(checkpoint_url) as checkpointer:
            # 使用会话ID从LangGraph的checkpointer中获取历史记录
            config = {"configurable": {"thread_id": session_id}}
            messages = await checkpointer.aget_tuple(config)
            history = messages.checkpoint.get("channel_values", {}).get("messages", [])
            return {"session_id": session_id, "history": history}
    except Exception as e:
        return {"session_id": session_id, "history": [], "error": str(e)}


# User API

from src.db.user_model import UserModel

user_model = UserModel()


class AddSessionRequest(BaseModel):
    """添加会话请求模型"""

    session_id: str
    user_id: str


@app.post("/api/users/sessions/create")
async def add_session_to_user(request: AddSessionRequest):
    """
    为用户添加会话ID

    Args:
        request: 包含会话ID和用户ID的请求

    Returns:
        操作结果
    """

    success = user_model.add_session_to_user(request.user_id, request.session_id)

    if success:
        return {"success": True, "message": "会话添加成功"}
    else:
        return {"success": False, "message": "会话添加失败"}


@app.get("/api/users/sessions/{user_id}")
async def get_user_sessions(user_id: str):
    """
    获取用户的所有会话ID

    Args:
        user_id: 用户ID

    Returns:
        包含用户会话ID的列表
    """
    sessions = user_model.get_user_sessions(user_id)
    return {"sessions": sessions}


def main():
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


# `if __name__ == "__main__":` 语句用于判断当前脚本是否是作为主程序直接运行。
# 当脚本作为主程序直接运行时，`__name__` 变量的值为 `"__main__"`，此时会执行 `main()` 函数；
# 若脚本是被其他模块导入，则 `__name__` 的值为模块名，`main()` 函数不会被执行。


if __name__ == "__main__":
    # graph.get_graph().draw_mermaid_png(output_file_path="researcher.png")
    main()
