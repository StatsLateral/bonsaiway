import os
from dotenv import load_dotenv
import openai

load_dotenv()
api_key = os.environ.get("OPENAI_API_KEY")
openai.api_key = api_key

try:
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say hello in one sentence."}
        ],
        max_tokens=20
    )
    print("OpenAI API test successful! Response:")
    print(response.choices[0].message.content)
except Exception as e:
    print(f"OpenAI API test failed: {e}")
