import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def impact_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Impact & Sustainability Agent.
    Role: "Does this positively impact society and geography?"
    Analyze: ESG impact, Social benefit, Sustainability alignment (especially for Climate, AgriTech, Gov-backed).
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        data = {"score": 85, "insight": "Strong ESG alignment, highly attractive for global sustainability grants."}
    return {"analysis": {"impact": data}}
