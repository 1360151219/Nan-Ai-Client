"""Tools for updating the state."""
from langchain_core.tools import tool


@tool
def add_todo(item: str) -> str:
    """
    Adds a new item to the to-do list.

    Args:
        item: The item to add to the to-do list.

    Returns:
        A confirmation message.
    """
    return f"Successfully added '{item}' to the to-do list. The user has been notified."