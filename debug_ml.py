import sys
import os

# Add backend to path so we can import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from services.ml_service import MLService

try:
    service = MLService()
    data = {
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
    
    # We need to manually preprocess because routes.py does it before calling predict_risk
    if service.catboost_model:
        with open('debug_result.txt', 'w') as f:
            f.write(f"Model Features: {service.catboost_model.feature_names_}\n")
            
    from services.data_service import DataService
    data_service = DataService()
    processed_data = data_service.preprocess_for_prediction(data)
    
    print("Processed Data:")
    print(processed_data)
    
    score, label, prob = service.predict_risk(processed_data, model_type='catboost')
    with open('debug_result.txt', 'a') as f:
        f.write(f"Result: Score={score}, Label={label}, Prob={prob}")

except Exception as e:
    with open('debug_result.txt', 'a') as f:
        f.write(f"\nCRITICAL ERROR: {e}")
    print(f"\nCRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
