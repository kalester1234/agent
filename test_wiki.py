import requests
import json
url = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=Infosys&format=json"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers)
data = resp.json()
extract = list(data['query']['pages'].values())[0]['extract']
print("Extract length:", len(extract))
print("Contains revenue?", "revenue" in extract.lower())
if "revenue" in extract.lower():
    import re
    # print context around revenue
    match = re.search(r'.{0,50}revenue.{0,50}', extract, re.IGNORECASE)
    if match: print("Snippet:", match.group(0))
