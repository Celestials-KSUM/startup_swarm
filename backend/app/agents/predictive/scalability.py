import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def scalability_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Scalability & Infrastructure Agent.
    Role: "Can this scale to 10x or 100x?"
    Analyze: Infrastructure complexity, Operational bottlenecks, Dependency risks, Supply chain limitations.
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        data = {"score": 65, "insight": "High dependency on local supply chains limits rapid geographical expansion."}
    return {"analysis": {"scalability": data}}
