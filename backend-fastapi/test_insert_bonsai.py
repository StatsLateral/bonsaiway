import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Minimal bonsai row (edit as needed for your schema)
bonsai_data = {
    "user_id": "test-user-id",  # Replace with a valid UUID if your schema requires
    "title": "Test Bonsai",
    "description": "Inserted from minimal script"
}

try:
    response = supabase.table("bonsais").insert(bonsai_data).execute()
    print("Insert response:", response)
except Exception as e:
    print("Insert failed:", e)
