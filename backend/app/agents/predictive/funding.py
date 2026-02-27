import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def funding_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Funding Agent.
    Role: "Is this fundable and investable?"
    Analyze: Business model, Monetization clarity, Funding stage readiness, Investor appeal.
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        data = {"score": 60, "insight": "Strong idea, but revenue model is unclear for seed investors."}
    return {"analysis": {"funding": data}}
