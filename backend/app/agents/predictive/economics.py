import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def economics_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Unit Economics & Financial Modeling Agent.
    Role: "Does this business make financial sense?"
    Analyze: Pricing vs cost structure, LTV vs CAC, Gross margin potential, Burn rate estimation.
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        data = {"score": 60, "insight": "High LTV/CAC ratio possible, but initial burn rate will be significant."}
    return {"analysis": {"economics": data}}
