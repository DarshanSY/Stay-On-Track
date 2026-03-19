import requests
import os

BASE_URL = "http://127.0.0.1:5000/api"
CSV_FILE = "temp_student.csv"

def create_csv():
    with open(CSV_FILE, "w") as f:
        f.write("Student ID,Name,Age,Gender,Current Semester,CGPA,Attendance,Risk Score,Risk Category\n")
        f.write("STU999,Test Student,20,M,1,8.0,90.0,10.0,Low\n")

def upload_csv():
    url = f"{BASE_URL}/students/upload"
    with open(CSV_FILE, 'rb') as f:
        files = {'file': (CSV_FILE, f, 'text/csv')}
        print(f"Uploading {CSV_FILE}...")
        resp = requests.post(url, files=files)
        print(f"Upload Status: {resp.status_code}")
        print(f"Upload Response: {resp.json()}")

def test_login():
    url = f"{BASE_URL}/student/login"
    payload = {"student_id": "STU999", "password": "password123"}
    resp = requests.post(url, json=payload)
    print(f"Login STU999 with 'password123': {resp.status_code}")
    if resp.status_code == 200:
        print("SUCCESS (Expected behavior after fix)")
    else:
        print("FAILED (Unexpected behavior after fix)")

    # Test fallback
    payload_fallback = {"student_id": "STU999", "password": "STU999"}
    resp_fallback = requests.post(url, json=payload_fallback)
    print(f"Login STU999 with 'STU999' (Fallback): {resp_fallback.status_code}")

if __name__ == "__main__":
    try:
        create_csv()
        upload_csv()
        test_login()
    finally:
        if os.path.exists(CSV_FILE):
            os.remove(CSV_FILE)
