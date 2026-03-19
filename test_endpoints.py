
import requests

try:
    print("Checking health...")
    r = requests.get('http://localhost:5000/api/health')
    print(r.status_code)
    
    print("Checking analytics...")
    r = requests.get('http://localhost:5000/api/analytics')
    print(r.status_code)
    print(r.text[:200])
except Exception as e:
    print(e)
