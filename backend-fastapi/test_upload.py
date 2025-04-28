import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase credentials
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

print(f"Supabase URL: {supabase_url}")
print(f"Supabase Key: {'*' * 5 + supabase_key[-5:] if supabase_key else 'Not set'}")

# Test if the bonsai-images bucket exists
def test_bucket_exists():
    try:
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}"
        }
        response = requests.get(
            f"{supabase_url}/storage/v1/bucket/bonsai-images",
            headers=headers
        )
        print(f"Bucket check status: {response.status_code}")
        if response.status_code == 200:
            print("Bucket exists!")
            return True
        else:
            print(f"Bucket response: {response.text}")
            return False
    except Exception as e:
        print(f"Error checking bucket: {str(e)}")
        return False

# Create the bucket if it doesn't exist
def create_bucket():
    try:
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        data = {
            "id": "bonsai-images",
            "name": "bonsai-images",
            "public": True
        }
        response = requests.post(
            f"{supabase_url}/storage/v1/bucket",
            headers=headers,
            data=json.dumps(data)
        )
        print(f"Create bucket status: {response.status_code}")
        print(f"Create bucket response: {response.text}")
        return response.status_code in (200, 201)
    except Exception as e:
        print(f"Error creating bucket: {str(e)}")
        return False

if __name__ == "__main__":
    if not test_bucket_exists():
        print("Creating bucket...")
        create_bucket()
    else:
        print("Bucket already exists, no need to create it.")
