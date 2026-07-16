import requests
from bs4 import BeautifulSoup
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.post("https://lite.duckduckgo.com/lite/", data={"q": "pepul funding"}, headers=headers)
soup = BeautifulSoup(resp.text, "html.parser")
for tr in soup.find_all("tr")[:6]:
    print("TR:", tr)
