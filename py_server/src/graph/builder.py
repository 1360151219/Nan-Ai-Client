"""
This module defines the state and the graph for a simple chatbot.
"""

from typing import Annotated, Sequence
from langgraph.graph import StateGraph
from src.modals.chat_modal import chat_modal
from langgraph.graph.message import MessagesState
from pydantic import Field


class State(MessagesState):
    """State for the graph."""

    todos: Annotated[list, Field(description="The list of todos")]


def chatbot(state: State):
    """
    This is the core function of our chatbot. It takes the current
    conversation history and invokes the language model to get the next message.

    Args:
        state: The current state of the graph, containing the message history.

    Returns:
        A dictionary with the AI's response message.
    """
    return {
        "messages": chat_modal.invoke(state["messages"]),
        "todos": [{"task": "完成项目从 Flask 到 FastAPI 的迁移", "status": "done"}],
    }


# Create a new StateGraph with our custom State class
workflow = StateGraph(State)

# Add a node named "chatbot" that executes the `chatbot` function
workflow.add_node("chatbot", chatbot)

# Set the entry point of the graph to the "chatbot" node
workflow.set_entry_point("chatbot")

# After the "chatbot" node runs, the graph should end.
# The conversation loop will be handled by the main application logic.
workflow.add_edge("chatbot", "__end__")

# Compile the workflow into a runnable graph
graph = workflow.compile()
