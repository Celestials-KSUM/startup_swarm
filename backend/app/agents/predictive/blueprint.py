import json
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def blueprint_node(state: AgentState):
    llm = get_structural_llm()
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
        "pmfProbability": {{ "score": number, "insight": "string" }},
        "techFeasibility": {{ "score": number, "insight": "string" }},
        "fundingReadiness": {{ "score": number, "insight": "string" }},
        "legalCompliance": {{ "score": number, "insight": "string" }},
        "gtmStrategy": {{ "score": number, "insight": "string" }},
        "unitEconomics": {{ "score": number, "insight": "string" }},
        "scalabilityInfra": {{ "score": number, "insight": "string" }},
        "impactSustainability": {{ "score": number, "insight": "string" }},
        "supplyChainOps": {{ "score": number, "insight": "string" }},
        "dataAiRisk": {{ "score": number, "insight": "string" }}
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
                "pmfProbability": analysis.get('pmf', {"score": 0, "insight": "N/A"}),
                "techFeasibility": analysis.get('tech', {"score": 0, "insight": "N/A"}),
                "fundingReadiness": analysis.get('funding', {"score": 0, "insight": "N/A"}),
                "legalCompliance": analysis.get('legal', {"score": 0, "insight": "N/A"}),
                "gtmStrategy": analysis.get('gtm', {"score": 0, "insight": "N/A"}),
                "unitEconomics": analysis.get('economics', {"score": 0, "insight": "N/A"}),
                "scalabilityInfra": analysis.get('scalability', {"score": 0, "insight": "N/A"}),
                "impactSustainability": analysis.get('impact', {"score": 0, "insight": "N/A"}),
                "supplyChainOps": analysis.get('supply_chain', {"score": 0, "insight": "N/A"}),
                "dataAiRisk": analysis.get('data_ai', {"score": 0, "insight": "N/A"})
            },
            "strategicRoadmap": ["Fix the AI generation logic"]
        }
    return {"blueprint": blueprint}
