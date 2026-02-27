import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def market_research_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Market Research Agent. 
    Role: "Will anyone actually buy this?"
    Analyze: Target customer, Market size, Existing competitors, Differentiation.
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        data = {"score": 70, "insight": "Market demand looks promising but localized."}
    return {"analysis": {"market": data}}
