import requests
import sys

try:
    url = 'http://localhost:5000/api/students/upload'
    files = {'file': open(r'c:\Users\darsh\OneDrive\Desktop\student-ai\test_upload.csv', 'rb')}
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 200:
        print("SUCCESS")
    else:
        print("FAILED")
except Exception as e:
    print(f"Error: {e}")
