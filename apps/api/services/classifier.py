from groq import Groq
import json
import os

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def classify_item(content: str) -> dict:
    prompt = f"""Classify this input. Respond with ONLY a JSON object, nothing else. No explanation, no markdown.

Types: "task", "insight", "reference", "goal_update"

Input: "{content}"

JSON:"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=100,
        )
        text = response.choices[0].message.content.strip()
        start = text.find('{')
        end = text.rfind('}') + 1
        if start == -1:
            raise ValueError("No JSON found")
        return json.loads(text[start:end])
    except Exception as e:
        print(f"Classification error: {e}")
        return {"type": "insight", "tags": []}
