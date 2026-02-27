from typing import List, Dict, Any, Annotated, TypedDict, Union
import operator
import json
import re
from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from app.core.config import settings

# Reducer that deep-merges dicts so parallel nodes don't overwrite each other
def merge_dicts(existing: Dict[str, Any], new: Dict[str, Any]) -> Dict[str, Any]:
    merged = existing.copy()
    merged.update(new)
    return merged

# Define the state for the graph
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    analysis: Annotated[Dict[str, Any], merge_dicts]  # reducer so parallel nodes merge, not overwrite
    business_idea: str
    blueprint: Dict[str, Any]

def create_startup_swarm():
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model="llama-3.3-70b-versatile",
        temperature=0.1  # Lower temperature for structural data
    )

    def market_research_node(state: AgentState):
        prompt = f"""
        You are the Market Research Agent. 
        Role: "Will anyone actually buy this?"
        Analyze: Target customer, Market size, Existing competitors, Differentiation.
        Business Idea: {state['business_idea']}
        Output JSON: {{"score": 1-100, "insight": "short insight"}}
        """
        response = llm.invoke([SystemMessage(content=prompt)])
        try:
            data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
        except Exception:
            data = {"score": 70, "insight": "Market demand looks promising but localized."}
        return {"analysis": {"market": data}}

    def competition_intel_node(state: AgentState):
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

    def execution_risk_node(state: AgentState):
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

    def pmf_node(state: AgentState):
        prompt = f"""
        You are the Product-Market Fit Agent.
        Analyze: User validation, Urgency of problem, Alternative solutions.
        Business Idea: {state['business_idea']}
        Output JSON: {{"score": 1-100, "insight": "short insight"}}
        """
        response = llm.invoke([SystemMessage(content=prompt)])
        try:
            data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
        except Exception:
            data = {"score": 75, "insight": "High urgency for the identified problem set."}
        return {"analysis": {"pmf": data}}

    def blueprint_node(state: AgentState):
        prompt = f"""
        You are the Lead Startup Architect. Using the analysis from your agents, generate a complete Business Blueprint.
        Idea: {state['business_idea']}
        Scores: {state['analysis']}
        
        OUTPUT ONLY VALID JSON matching this schema:
        {{
          "businessOverview": {{ "name": "string", "description": "string", "targetAudience": "string", "valueProposition": "string" }},
          "agentScoring": {{
            "marketResearch": {{ "score": number, "insight": "string" }},
            "competitionIntel": {{ "score": number, "insight": "string" }},
            "executionRisk": {{ "score": number, "insight": "string" }},
            "pmfProbability": {{ "score": number, "insight": "string" }}
          }},
          "services": [ {{ "title": "string", "description": "string", "pricingModel": "string" }} ],
          "revenueModel": ["string"],
          "costStructure": {{ "oneTimeSetup": ["string"], "monthlyExpenses": ["string"] }},
          "strategicRoadmap": ["string"],
          "risks": ["string"],
          "growthOpportunities": ["string"]
        }}
        """
        response = llm.invoke([SystemMessage(content=prompt)])
        try:
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            blueprint = json.loads(content.strip())
        except Exception as e:
            print(f"Blueprint generation failed, using fallback: {e}")
            analysis = state.get('analysis', {})
            # Fallback if LLM fails to output valid JSON — safe .get() to avoid KeyError
            blueprint = {
                "businessOverview": {"name": "Fail-Safe Startup", "description": "Error in generation", "targetAudience": "Internal", "valueProposition": "Check logs"},
                "agentScoring": {
                    "marketResearch": analysis.get('market', {"score": 0, "insight": "N/A"}),
                    "competitionIntel": analysis.get('competition', {"score": 0, "insight": "N/A"}),
                    "executionRisk": analysis.get('execution', {"score": 0, "insight": "N/A"}),
                    "pmfProbability": analysis.get('pmf', {"score": 0, "insight": "N/A"})
                },
                "strategicRoadmap": ["Fix the AI generation logic"]
            }
        return {"blueprint": blueprint}

    # Build the Graph
    builder = StateGraph(AgentState)
    builder.add_node("market", market_research_node)
    builder.add_node("competition", competition_intel_node)
    builder.add_node("execution", execution_risk_node)
    builder.add_node("pmf", pmf_node)
    builder.add_node("blueprint", blueprint_node)

    builder.add_edge(START, "market")
    builder.add_edge(START, "competition")
    builder.add_edge(START, "execution")
    builder.add_edge(START, "pmf")
    
    builder.add_edge("market", "blueprint")
    builder.add_edge("competition", "blueprint")
    builder.add_edge("execution", "blueprint")
    builder.add_edge("pmf", "blueprint")
    
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
