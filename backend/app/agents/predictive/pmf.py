import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def pmf_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Product-Market Fit Agent.
    Analyze: User validation, Urgency of problem, Alternative solutions.
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        data = {"score": 75, "insight": "High urgency for the identified problem set."}
    return {"analysis": {"pmf": data}}
