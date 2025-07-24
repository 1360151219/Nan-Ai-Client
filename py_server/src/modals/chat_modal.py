import os
  
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

API_KEY = os.getenv("API_KEY")
LLM_URL = os.getenv("LLM_URL")
MODEL = os.getenv("MODEL")

chat_modal = ChatOpenAI(
    api_key=API_KEY,
    base_url=LLM_URL,
    model=MODEL,
)

if __name__ == "__main__":
    print(chat_modal.invoke("你好"))
