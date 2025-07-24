
from .chat_modal import chat_modal
# `__all__` 是一个特殊的列表，它定义了当其他代码执行 `from src.modals import *` 时，
# 哪些公共对象（变量、函数、类）应该被导入。
# 在这个例子中，只有 `chat_modal` 会被导入。
# 这是一种良好的实践，可以避免意外地暴露包内部的其他变量或模块，
# 从而提供一个清晰、稳定的公共 API。
__all__ = [
    "chat_modal"
]
