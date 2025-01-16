import requests
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

url = "https://api.bland.ai/v1/calls"

payload = {
    "phone_number": "+18582127078",
    "pathway_id": "9ac11b35-8525-4ae8-b75a-adecbe8c2bc4"
}
headers = {
    "authorization": os.getenv('BLAND_API_KEY'),
    "Content-Type": "application/json"
}

response = requests.request("POST", url, json=payload, headers=headers)

print(response.text)