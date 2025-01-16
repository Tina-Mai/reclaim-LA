import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

url = "https://api.bland.ai/v1/calls/8e95683f-28f9-42b9-8db0-6bd6b3521012"

headers = {"authorization": os.getenv('BLAND_API_KEY')}

response = requests.request("GET", url, headers=headers)

print(response.text)