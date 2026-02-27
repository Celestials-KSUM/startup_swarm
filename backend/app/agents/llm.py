from langchain_groq import ChatGroq
from app.core.config import settings

def get_structural_llm():
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model="llama-3.3-70b-versatile",
        temperature=0.1  # Lower temperature for structural data
    )
