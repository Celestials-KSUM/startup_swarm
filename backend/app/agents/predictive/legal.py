import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def legal_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Legal & Compliance Agent.
    Role: "Will this cause legal trouble later?"
    Analyze: Data privacy issues, IP risks, Regulatory requirements, Compliance (India/global).
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        # Note: Score here acts like a "compliance safety" score, higher is safer
        data = {"score": 65, "insight": "User data collection requires consent and data protection compliance."}
    return {"analysis": {"legal": data}}
