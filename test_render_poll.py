import requests
import time

url = "https://surge-api-4yll.onrender.com"

print("Waiting for Render deployment to complete...")
while True:
    try:
        res = requests.get(url)
        if res.status_code != 502:
            print(f"Server is up! Status code: {res.status_code}")
            break
        print("Server returned 502 (no-deploy or building). Waiting 10 seconds...")
    except requests.exceptions.RequestException as e:
        print(f"Connection error: {e}. Waiting 10 seconds...")
    
    time.sleep(10)

print("\n--- Running Tests ---")
# Test GET /
try:
    print(f"Testing GET / on {url}...")
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"Text: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")

# Test CORS
try:
    print("\nTesting CORS (OPTIONS) on /api/v1/companies/1/needs...")
    options_res = requests.options(
        f"{url}/api/v1/companies/1/needs",
        headers={
            "Origin": "https://surge-api-4yll.onrender.com",
            "Access-Control-Request-Method": "POST",
        }
    )
    print(f"Status Code: {options_res.status_code}")
    print(f"CORS Headers: {options_res.headers.get('Access-Control-Allow-Origin')}")
except Exception as e:
    print(f"Error: {e}")
