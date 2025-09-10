from langgraph.prebuilt import create_react_agent
from src.modals import chat_modal
from src.tools import search
from src.prompts.apply import apply_prompt_template


planner = create_react_agent(
  model=chat_modal,
  tools=[search],
  prompt=apply_prompt_template("planner"),
  name="planner"
)
