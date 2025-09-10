from langgraph_supervisor import create_supervisor

from src.agents.planner import planner
from src.agents.researcher import researcher
from src.modals import chat_modal
from src.prompts.apply import apply_prompt_template

supervisor = create_supervisor(
    [planner, researcher],
    model=chat_modal,
    prompt=apply_prompt_template("supervisor"),
).compile()