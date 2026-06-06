from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from fastapi.middleware.cors import CORSMiddleware

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_classic.memory import ConversationBufferWindowMemory

from tool1 import answer_tool
from tool2 import search_tool

load_dotenv()

app = FastAPI(
    title="LangChain Agent API",
    version="1.0"
)

# ---------------------------
# CORS
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],      # Allow all HTTP methods
    allow_headers=["*"],      # Allow all headers
)

# ---------------------------
# Memory
# ---------------------------
memory = ConversationBufferWindowMemory(
    k=5,
    memory_key="chat_history",
    return_messages=True
)

# ---------------------------
# LLM
# ---------------------------
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.1-8b-instant"
)

# ---------------------------
# Prompt
# ---------------------------
prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a chatbot with 3 modes.

Important Instructions:
- Call every tool only once.
- If the user asks about previous messages,
  conversation history, or memory,
  answer directly from chat_history.
- Do not call any tool in that case.

Mode 1: General Questions (using answer_tool)

Mode 2: Web Search Mode (using search_tool)
Use when the question contains:
- current
- latest
- news
- weather
- stock price
- sports scores
- real-time information

After calling search_tool:
- Do not call any other tool.
- Answer only from search results.
- Call search_tool only once.

Mode 3: RAG Tool

Final answer must be concise and under 100 words.
"""
    ),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    SystemMessage(content="You are an AI chatbot with 3 modes."),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])

# ---------------------------
# Tools
# ---------------------------
tools = [answer_tool, search_tool]

# ---------------------------
# Agent
# ---------------------------
agent = create_tool_calling_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    memory=memory,
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=2
)

# ---------------------------
# Request Schema
# ---------------------------
class ChatRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    answer: str


# ---------------------------
# API Endpoint
# ---------------------------
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    response = agent_executor.invoke({
        "input": request.query
    })

    return ChatResponse(
        answer=response["output"]
    )


# ---------------------------
# Health Check
# ---------------------------
@app.get("/")
async def root():
    return {"message": "LangChain Agent Running"}