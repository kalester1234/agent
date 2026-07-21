import requests

url = "https://surge-api-4yll.onrender.com/api/v1/" # Or whatever the base URL is
headers = {
    "Origin": "http://localhost:3000"
}

try:
    print(f"Testing GET / on {url}...")
    response = requests.get("https://surge-api-4yll.onrender.com/")
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {response.headers}")
    print(f"Text: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")

try:
    print("\nTesting CORS (OPTIONS) on /api/v1/companies/1/needs...")
    options_res = requests.options(
        "https://surge-api-4yll.onrender.com/api/v1/companies/1/needs",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        }
    )
    print(f"Status Code: {options_res.status_code}")
    print(f"CORS Headers: {options_res.headers.get('Access-Control-Allow-Origin')}")
except Exception as e:
    print(f"Error: {e}")
