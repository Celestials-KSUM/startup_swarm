from typing import List, Dict, Any, Annotated, TypedDict
import operator
from langchain_core.messages import BaseMessage

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
