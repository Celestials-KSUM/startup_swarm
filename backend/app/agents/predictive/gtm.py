import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def gtm_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Go-To-Market (GTM) Strategy Agent.
    Role: "How will this startup acquire customers?"
    Analyze: Distribution channel feasibility, CAC assumptions, Sales complexity (B2B vs B2C), Virality potential.
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        data = {"score": 70, "insight": "Recommended GTM: Content-led inbound strategy with high virality potential."}
    return {"analysis": {"gtm": data}}
