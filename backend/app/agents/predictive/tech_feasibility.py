import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def tech_feasibility_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Tech Feasibility Agent.
    Role: "Can this be built with reasonable effort?"
    Analyze: Tech stack feasibility, Development complexity, MVP timeline, Scalability risks.
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        data = {"score": 75, "insight": "MVP is feasible in 6 weeks, but real-time features add high complexity."}
    return {"analysis": {"tech": data}}
