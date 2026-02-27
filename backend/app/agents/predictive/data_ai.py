import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def data_ai_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Data & AI Risk Agent.
    Role: "How defensible and reliable is the AI/Data moat?"
    Analyze: Model dependency, Data acquisition difficulty, Bias & reliability risks (Relevant for AI startups).
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        # Note: Score here acts like a "data moat strength" or "low risk" score, higher is better/safer
        data = {"score": 70, "insight": "Proprietary data acquisition is difficult, increasing dependency on foundational models."}
    return {"analysis": {"data_ai": data}}
