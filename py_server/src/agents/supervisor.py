from typing import TypedDict,Sequence
from langgraph.graph.message import AnyMessage,add_messages
from pydantic import Field
from typing_extensions import Annotated
from langgraph.graph import StateGraph, state
from langgraph_supervisor import create_supervisor

from src.agents.planner import planner
from src.agents.researcher import researcher
from src.modals import chat_modal
from src.prompts.apply import apply_prompt_template



class State(TypedDict):
    todos: Annotated[list, Field(description="The list of todos")]
    messages: Annotated[Sequence[AnyMessage], add_messages]
    remaining_steps: int


supervisor = create_supervisor(
    [planner, researcher],
    state_schema=State,
    model=chat_modal,
    prompt=apply_prompt_template("supervisor"),
).compile()
