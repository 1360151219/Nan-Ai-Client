import uuid

from langgraph.graph.state import CompiledStateGraph

def run_agent(agent: CompiledStateGraph, message: str):
    result = agent.stream(
        {"messages": [{"role": "user", "content": message}]},
        stream_mode="values",
        config={"thread_id": uuid.uuid4()},
    )
    for chunk in result:
        messages = chunk["messages"]
        last_message = messages[-1]
        last_message.pretty_print()


def run_agent_api(agent: CompiledStateGraph, message: str):
    result = agent.stream(
        {"messages": [{"role": "user", "content": message}]},
        stream_mode="values",
        config={"thread_id": uuid.uuid4()},
    )
    message_list = []
    for chunk in result:
        messages = chunk["messages"]
        last_message = messages[-1]
        print(last_message)
        message_list.append(last_message.content)
    return message_list

