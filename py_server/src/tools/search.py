from langchain.tools import tool


@tool
def search(query: str) -> str:
    """
    Search the internet and return the results.

    Args:
        query: The search query.

    Returns:
        The search results.
    """
    return "搜索结果: 今天深圳天气情况：晴天，温度25℃，湿度60%，风速10m/s"
