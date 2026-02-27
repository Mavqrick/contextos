from langchain_ollama import OllamaLLM
import json

# Increased timeout to 60 seconds
llm = OllamaLLM(model="llama3.2", timeout=60)

def classify_item(content: str) -> dict:
    prompt = f"""Classify this input. Respond with ONLY a JSON object, nothing else.

Types: "task", "insight", "reference", "goal_update"

Input: "{content}"

JSON response:"""

    try:
        response = llm.invoke(prompt)
        cleaned = response.strip()
        start = cleaned.find('{')
        end = cleaned.rfind('}') + 1
        if start == -1:
            raise ValueError("No JSON found")
        json_str = cleaned[start:end]
        result = json.loads(json_str)
        return result
    except Exception:
        # Fallback if LLM fails or times out
        return {"type": "insight", "tags": []}