from openai import OpenAI
from .prompting import SYSTEM_RULES


def make_client(base_url="http://localhost:11434/v1", api_key="ollama"):
    return OpenAI(base_url=base_url, api_key=api_key)


def call_llm(client, model, user_prompt, error_context=None):
    messages = [{"role": "system", "content": SYSTEM_RULES}]
    content = user_prompt if not error_context else f"{user_prompt}\n\nPREVIOUS ATTEMPT ERROR:\n{error_context}"
    messages.append({"role": "user", "content": content})
    response = client.chat.completions.create(model=model, messages=messages)
    return response.choices[0].message.content
