import requests
import json

try:
    url = 'http://localhost:5000/api/interventions'
    headers = {'Content-Type': 'application/json'}
    data = {
        'student_id': 'STU001',
        'title': 'Test Plan',
        'type': 'Academic Support',
        'description': 'Test Description',
        'status': 'Planned',
        'assigned_to': 'Counselor'
    }
    
    # Try POST
    print(f"Testing POST to {url} with data: {data}")
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"Error: {e}")
