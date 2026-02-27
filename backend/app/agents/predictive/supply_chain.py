import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def supply_chain_node(state: AgentState):
    llm = get_structural_llm()
    prompt = f"""
    You are the Supply Chain & Operations Agent.
    Role: "How complex and risky is the physical delivery/operations?"
    Analyze: Vendor dependency, Logistics complexity, Inventory risk (especially for Food, Hardware, Consumer Goods).
    Business Idea: {state['business_idea']}
    Output JSON: {{"score": 1-100, "insight": "short insight"}}
    """
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception:
        data = {"score": 60, "insight": "High inventory risk and complex logistics could strain early cash flow."}
    return {"analysis": {"supply_chain": data}}
