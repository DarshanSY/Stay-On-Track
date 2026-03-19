import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def test_login(student_id, password):
    url = f"{BASE_URL}/student/login"
    payload = {
        "student_id": student_id,
        "password": password
    }
    
    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"Login attempt for {student_id} with pass '{password}': Status {response.status_code}")
        if response.status_code == 200:
            print("  Success!")
        else:
            print(f"  Failed: {response.json()}")
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    print("Testing STU001 (Should Success)...")
    test_login("STU001", "password123")
    
    print("\nTesting STU010 (Should Fail currently)...")
    test_login("STU010", "password123")
    
    print("\nTesting STU010 with ID as password (Fallback check)...")
    test_login("STU010", "STU010")
