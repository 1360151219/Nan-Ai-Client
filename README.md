# 项目说明

## 环境变量

在根目录下创建 `.env` 文件，配置以下环境变量：

```
# 敏感信息（示例）
API_KEY=123-456-789
LLM_URL=https://你的域名/api/chat
MODEL=模型id
```


## uv

```bash
uv init <project_name>

uv add langchain ..

uv run main.py
```


## QA



### 为什么我在ide中看不到import 第三方库的类型

解决方案：在 IDE 中选择虚拟环境的 Python 解释器

我将以 VS Code 为例，为您提供详细的步骤。如果您使用其他 IDE，操作逻辑也是类似的。

1. 1.
   打开命令面板
   
   - 在您的 Mac 上，使用快捷键 Cmd + Shift + P (⇧⌘P) 来打开 VS Code 的命令面板。
2. 2.
   选择 Python 解释器
   
   - 在命令面板中，输入并搜索 Python: Select Interpreter (Python: 选择解释器)，然后按回车键。
3. 3.
   选择您项目中的虚拟环境
   
   - 点击后，VS Code 会显示一个可用的 Python 解释器列表。
   - 您需要选择带有 ('.venv': venv) 标识的那个，它的路径应该指向您项目中的虚拟环境。根据您的情况，路径应该类似于： ./.venv/bin/python
   - 如果列表中没有自动显示，您可以点击 "Enter interpreter path..." (输入解释器路径...) 并手动选择以下文件： /Users/bytedance/workspace/nan/py_server/.venv/bin/python