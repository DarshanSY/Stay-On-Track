import requests
import json

# Check one specific student
response = requests.get('http://localhost:5000/api/students/STU9001')
print("Status Code:", response.status_code)
print("\nStudent Data:")
print(json.dumps(response.json(), indent=2))
