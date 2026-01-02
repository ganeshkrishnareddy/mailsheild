import requests
import time

try:
    print("Testing connection to http://127.0.0.1:8000/...")
    response = requests.get("http://127.0.0.1:8000/", timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Connection failed: {e}")
