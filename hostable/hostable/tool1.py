from langchain_core.tools import StructuredTool
from pydantic import BaseModel
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

load_dotenv()


# Initialize LLM
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.1-8b-instant"
)


class QuestionInput(BaseModel):
    question: str


def answer_question(question: str):
    """
    Sends the user's question directly to the LLM
    and returns the response.
    """
    response = llm.invoke(question)
    return response.content


# Create Tool
answer_tool = StructuredTool.from_function(
    name="answer_question",
    description="Answer any user question using the LLM 100 words.",
    func=answer_question,
    args_schema=QuestionInput
)