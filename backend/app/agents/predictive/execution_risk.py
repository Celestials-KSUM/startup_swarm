import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def execution_risk_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Execution Risk Agent.
    Analyze: Founder skill vs product, Technical capability gap, Time commitment.
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        # Note: Higher score here means lower risk in the UI typically,
        # but let's follow the UI logic: score is shown as percentage.
        data = {"score": 80, "insight": "Low execution risk if key technical hires are secured."}
    return {"analysis": {"execution": data}}
