from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from app.core.config import settings

from app.agents.state import AgentState
from app.agents.predictive.market_research import market_research_node
from app.agents.predictive.competition_intel import competition_intel_node
from app.agents.predictive.execution_risk import execution_risk_node
from app.agents.predictive.pmf import pmf_node
from app.agents.predictive.tech_feasibility import tech_feasibility_node
from app.agents.predictive.funding import funding_node
from app.agents.predictive.legal import legal_node
from app.agents.predictive.gtm import gtm_node
from app.agents.predictive.economics import economics_node
from app.agents.predictive.scalability import scalability_node
from app.agents.predictive.impact import impact_node
from app.agents.predictive.supply_chain import supply_chain_node
from app.agents.predictive.data_ai import data_ai_node
from app.agents.predictive.blueprint import blueprint_node

def create_startup_swarm():
    # Build the Graph
    builder = StateGraph(AgentState)
    builder.add_node("market", market_research_node)
    builder.add_node("competition", competition_intel_node)
    builder.add_node("execution", execution_risk_node)
    builder.add_node("pmf", pmf_node)
    builder.add_node("tech", tech_feasibility_node)
    builder.add_node("funding", funding_node)
    builder.add_node("legal", legal_node)
    builder.add_node("gtm", gtm_node)
    builder.add_node("economics", economics_node)
    builder.add_node("scalability", scalability_node)
    builder.add_node("impact", impact_node)
    builder.add_node("supply_chain", supply_chain_node)
    builder.add_node("data_ai", data_ai_node)
    builder.add_node("blueprint", blueprint_node)

    builder.add_edge(START, "market")
    builder.add_edge(START, "competition")
    builder.add_edge(START, "execution")
    builder.add_edge(START, "pmf")
    builder.add_edge(START, "tech")
    builder.add_edge(START, "funding")
    builder.add_edge(START, "legal")
    builder.add_edge(START, "gtm")
    builder.add_edge(START, "economics")
    builder.add_edge(START, "scalability")
    builder.add_edge(START, "impact")
    builder.add_edge(START, "supply_chain")
    builder.add_edge(START, "data_ai")
    
    builder.add_edge("market", "blueprint")
    builder.add_edge("competition", "blueprint")
    builder.add_edge("execution", "blueprint")
    builder.add_edge("pmf", "blueprint")
    builder.add_edge("tech", "blueprint")
    builder.add_edge("funding", "blueprint")
    builder.add_edge("legal", "blueprint")
    builder.add_edge("gtm", "blueprint")
    builder.add_edge("economics", "blueprint")
    builder.add_edge("scalability", "blueprint")
    builder.add_edge("impact", "blueprint")
    builder.add_edge("supply_chain", "blueprint")
    builder.add_edge("data_ai", "blueprint")
    
    builder.add_edge("blueprint", END)

    return builder.compile()

# Singleton instance
startup_agent = create_startup_swarm()

# Simple chat function for the discovery phase
async def get_discovery_insight(idea: str):
    llm = ChatGroq(api_key=settings.GROQ_API_KEY, model="llama-3.3-70b-versatile", temperature=0.7)
    prompt = [
        SystemMessage(content="You are the Lead Startup Architect. Provide a strategic, founder-level 'First Impression' of this idea. Show that you understand the niche. Provide 2-3 'Architect Tips' specific to that domain. Be encouraging but realistic. Keep it concise (2 paragraphs)."),
        HumanMessage(content=idea)
    ]
    response = await llm.ainvoke(prompt)
    return response.content
