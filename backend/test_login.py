import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_login():
    print("Testing Student Login...")
    
    # login with default password
    payload = {
        "student_id": "STU001",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/student/login", json=payload)
        if response.status_code == 200:
            print("Login SUCCESS!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Login FAILED: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Test failed with error: {e}")

if __name__ == "__main__":
    test_login()
