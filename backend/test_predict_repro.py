import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_prediction(attendance, cgpa, semester, engine):
    payload = {
        "model_type": engine,
        "Attendance": attendance,
        "CGPA": cgpa,
        "Current Semester": semester,
        "Age": 21,
        "Gender": "Male",
        "Credits_Completed": (semester - 1) * 20,
        "Fee_Delay_Indicator": 0,
        "Family_Background_Score": 8,
        "Learning_Disability_Flag": 0,
        "LMS_Login_Count": 50,
        "Assignment_Submission_Rate": 90
    }
    
    print(f"\n--- Testing Engine: {engine} ---")
    print(f"Input: Att={attendance}, CGPA={cgpa}, Sem={semester}")
    
    try:
        response = requests.post(f"{BASE_URL}/predict", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("Response:", json.dumps(data, indent=2))
            
            prob = data.get('probability')
            model_used = data.get('model_used')
            
            print(f"Probability: {prob}")
            print(f"Model Used: {model_used}")
            
            if engine == 'ensemble' and model_used != 'ensemble':
                print("FAILURE: Engine mismatch!")
            elif prob == 0.5:
                print("WARNING: Probability is exactly 0.5 (Default?)")
            else:
                print("SUCCESS: Valid prediction.")
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    # Test 1: Good Student (Ensemble)
    test_prediction(100, 9.0, 4, "ensemble")
    
    # Test 2: Risk Student (Ensemble)
    test_prediction(40, 4.5, 4, "ensemble")
    
    # Test 3: Specific Engine (Logistic)
    test_prediction(80, 7.5, 4, "logistic")
    
    # Test 4: Specific Engine (Neural)
    test_prediction(80, 7.5, 4, "neural")
