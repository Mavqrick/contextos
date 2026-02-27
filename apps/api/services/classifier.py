from langchain_ollama import OllamaLLM
import json

llm = OllamaLLM(model="llama3.2")

def classify_item(content: str) -> dict:
    prompt = f"""You are a classifier for a personal knowledge management system.

Classify this input into exactly one type:
- "task": something the user needs to do
- "insight": an idea, thought, or learning
- "reference": a link, resource, or factual info
- "goal_update": an update to the user's goals or projects

Also extract 1-3 short tags (single words or short phrases).

Input: "{content}"

Respond with ONLY valid JSON, no explanation:
{{"type": "insight", "tags": ["productivity", "focus"]}}"""

    response = llm.invoke(prompt)
    
    # Clean response and parse JSON
    cleaned = response.strip()
    # Find JSON in response
    start = cleaned.find('{')
    end = cleaned.rfind('}') + 1
    json_str = cleaned[start:end]
    
    result = json.loads(json_str)
    return result