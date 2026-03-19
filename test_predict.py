import requests
import json

url = "http://localhost:5000/api/predict"
payload = {
    "model_type": "catboost",
    "Attendance": 80,
    "CGPA": 8.5,
    "Current Semester": 4,
    "Age": 21,
    "Gender": "Female",
    "Credits_Completed": 60,
    "Fee_Delay_Indicator": 0,
    "Family_Background_Score": 7,
    "Learning_Disability_Flag": 0,
    "LMS_Login_Count": 45,
    "Assignment_Submission_Rate": 85
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
