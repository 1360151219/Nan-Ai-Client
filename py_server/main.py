
from src.agents.run_agent import run_agent
from src.agents.researcher import researcher
def main():
    run_agent(researcher, "今天深圳天气怎么样")



# `if __name__ == "__main__":` 语句用于判断当前脚本是否是作为主程序直接运行。
# 当脚本作为主程序直接运行时，`__name__` 变量的值为 `"__main__"`，此时会执行 `main()` 函数；
# 若脚本是被其他模块导入，则 `__name__` 的值为模块名，`main()` 函数不会被执行。


if __name__ == "__main__":
    main()
    researcher.get_graph().draw_mermaid_png(output_file_path="researcher.png")
