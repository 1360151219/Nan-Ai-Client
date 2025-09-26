import mimetypes
import uuid
from textwrap import indent
from typing import Optional
from fastapi.responses import StreamingResponse
from fastapi.routing import json
from langchain_core.messages import BaseMessage, HumanMessage
from pydantic import BaseModel
from src.agents.run_agent import run_agent, run_agent_api
from src.agents.researcher import researcher
from src.coze.rag import list_datasets
from src.graph.builder import graph

from fastapi import FastAPI, Request
import uvicorn

from utils import to_printable

app = FastAPI()

# In-memory store for chat histories

chat_histories = {}


@app.get("/api/datasets/list")
def list_all_datasets():
    """List all datasets."""
    datasets = list_datasets()
    # 将每个 dataset 对象转换为字典，以便进行 JSON 序列化
    datasets_json = [dataset.model_dump() for dataset in datasets]
    return json.dumps(datasets_json, indent=2)


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


@app.post("/api/chat")
async def chat_with_llm(chat_request: ChatRequest):
    """
    Handles a chat request with the language model, supporting streaming responses.

    This endpoint receives a message from the client, sends it to the LangGraph-based
    chatbot, and streams the response back to the client using Server-Sent Events (SSE).
    It leverages asynchronous programming to handle the streaming efficiently.
    """
    message = chat_request.message
    session_id = chat_request.session_id or str(uuid.uuid4())

    if not message:
        return json.dumps({"error": "Message not provided"}), 400

    # Retrieve history or create a new one
    history = chat_histories.setdefault(session_id, [])
    history.append(
        HumanMessage(content=message),
    )

    async def event_stream():
        """An async generator function to stream responses."""
        init_state = {"messages": HumanMessage(content=message), "todos": []}
        # The `stream` method returns a generator of events as they occur.
        async for state in graph.astream(input=init_state, stream_mode="values"):
            data_to_send = {"session_id": session_id}
            # Check for messages and get the last one's content
            if state.get("messages"):
                chat_histories[session_id] = state["messages"]
                last_message = state["messages"][-1]
                if hasattr(last_message, "content"):
                    data_to_send["message"] = last_message.content

            # Check for and include the todos list
            if state.get("todos"):
                data_to_send["todos"] = state["todos"]

            # Only send an event if there's a message to send
            if data_to_send.get("message"):
                print(f"state: {json.dumps(to_printable(state))}")
                # Format as a Server-Sent Event (SSE) with a JSON payload
                yield f"data: {json.dumps(data_to_send, ensure_ascii=False)}\n\n"

    # Return a streaming response.
    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/api/chat/history/{session_id}")
def get_chat_history(session_id: str):
    """
    Retrieves the chat history for a given session ID.
    """
    history = chat_histories.get(session_id, [])
    return {"session_id": session_id, "history": to_printable(history)}


def main():
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


# `if __name__ == "__main__":` 语句用于判断当前脚本是否是作为主程序直接运行。
# 当脚本作为主程序直接运行时，`__name__` 变量的值为 `"__main__"`，此时会执行 `main()` 函数；
# 若脚本是被其他模块导入，则 `__name__` 的值为模块名，`main()` 函数不会被执行。


if __name__ == "__main__":
    # graph.get_graph().draw_mermaid_png(output_file_path="researcher.png")
    main()
