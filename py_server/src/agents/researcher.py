from langgraph.prebuilt import create_react_agent
from src.modals import chat_modal
researcher = create_react_agent(
  model=chat_modal,
  prompt=''
)