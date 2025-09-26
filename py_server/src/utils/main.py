from langchain_core.messages import BaseMessage


def to_printable(obj):
    """
    Recursively converts an object to a printable format, handling BaseMessage objects.
    """
    if isinstance(obj, dict):
        return {k: to_printable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [to_printable(i) for i in obj]
    elif isinstance(obj, BaseMessage):
        return {"type": obj.type, "content": obj.content}
    else:
        return obj
