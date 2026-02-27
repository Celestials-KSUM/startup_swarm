import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def competition_intel_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Competition Intelligence Agent.
    Analyze: Moat strength, Network effects, Switching costs, IP defensability.
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        data = {"score": 65, "insight": "Defensibility relies on execution speed and brand quality."}
    return {"analysis": {"competition": data}}
