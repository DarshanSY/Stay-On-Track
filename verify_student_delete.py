import requests
import json
import os

BASE_URL = 'http://127.0.0.1:5000/api'

def test_student_delete_flow():
    # 1. Create a dummy student via upload
    print("Creating dummy student via CSV upload...")
    csv_content = "Student ID,Name,Age,Gender,Current Semester,CGPA,Attendance\nDELETE_TEST_001,Delete Me,20,Female,1,8.5,90"
    
    with open("temp_upload.csv", "w") as f:
        f.write(csv_content)
        
    try:
        with open("temp_upload.csv", "rb") as f:
            files = {'file': f}
            resp = requests.post(f"{BASE_URL}/students/upload", files=files)
            if resp.status_code != 200:
                print(f"Failed to upload student: {resp.status_code} {resp.text}")
                return
            print("Student uploaded.")
            
        # 2. Get the student ID (database ID)
        resp = requests.get(f"{BASE_URL}/students/DELETE_TEST_001")
        if resp.status_code != 200:
             print(f"Failed to fetch uploaded student: {resp.status_code} {resp.text}")
             return
             
        student = resp.json()
        db_id = student['id']
        print(f"Student created with DB ID: {db_id}")
        
        # 3. Add an intervention to create a foreign key dependency
        print("Adding intervention...")
        intervention_data = {
            "student_id": "DELETE_TEST_001",
            "title": "Block Delete Test",
            "type": "Test",
            "description": "This should block deletion",
            "status": "Planned",
            "assigned_to": "Tester"
        }
        resp = requests.post(f"{BASE_URL}/interventions", json=intervention_data)
        if resp.status_code != 201:
            print(f"Failed to create intervention: {resp.status_code} {resp.text}")
        else:
            print("Intervention created.")

        # 4. Attempt to delete the student
        print(f"Attempting to delete student with ID {db_id}...")
        del_resp = requests.delete(f"{BASE_URL}/students/{db_id}")
        
        if del_resp.status_code == 200:
            print("Success! Student deleted (Unexpected if foreign key constraint exists and no cascade).")
        else:
            print(f"Failed to delete: {del_resp.status_code} {del_resp.text}")
            
    except Exception as e:
        print(f"Exception occurred: {e}")
    finally:
        if os.path.exists("temp_upload.csv"):
            os.remove("temp_upload.csv")

if __name__ == "__main__":
    test_student_delete_flow()
