import requests
from bs4 import BeautifulSoup

BASE = "https://pzhgp.pl"

def find_release_docs(index_url: str = BASE):
    r = requests.get(index_url, timeout=20)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, 'html.parser')
    links = []
    for a in soup.select('a[href]'):
        href = a['href']
        if any(x in href.lower() for x in ['wspolrzed', 'współrzęd', 'wypus', 'release']):
            links.append(href if href.startswith('http') else BASE + href)
    return sorted(set(links))

if __name__ == '__main__':
    for url in find_release_docs():
        print(url)

