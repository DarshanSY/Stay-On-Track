import pandas as pd
import numpy as np

class DataService:
    def preprocess_for_prediction(self, data):
        # Flexible key mapping
        # Frontend sends: Attendance, CGPA, 'Current Semester', Age, Gender
        mapped_data = {
            'Age': int(data.get('Age', 20)),
            'Gender': str(data.get('Gender', 'Male')),
            'Current_Semester': int(data.get('Current Semester') or data.get('Current_Semester', 4)),
            'CGPA': float(data.get('CGPA', 7.5)),
            'Attendance_Percentage': float(data.get('Attendance') or data.get('Attendance_Percentage', 75.0)),
            'Failed_Courses': int(data.get('Failed_Courses', 0)),
            'LMS_Login_Count': int(data.get('LMS_Login_Count', 50)),
            'Assignment_Submission_Rate': float(data.get('Assignment_Submission_Rate', 90.0)),
            'Credits_Completed': int(data.get('Credits_Completed', 20)),
            'Fee_Delay_Indicator': int(data.get('Fee_Delay_Indicator', 0)),
            'Family_Background_Score': int(data.get('Family_Background_Score', 5)),
            'Learning_Disability_Flag': int(data.get('Learning_Disability_Flag', 0))
        }
        
        # Create DataFrame
        df = pd.DataFrame([mapped_data])
        
        # Enforce column order to match model training exactly
        # Based on dataset_generator.py structure
        expected_order = [
            'Age', 'Gender', 'Current_Semester', 'CGPA', 'Attendance_Percentage', 
            'Failed_Courses', 'Credits_Completed', 'Fee_Delay_Indicator', 
            'Family_Background_Score', 'Learning_Disability_Flag', 
            'LMS_Login_Count', 'Assignment_Submission_Rate'
        ]
        
        # Add missing columns if any (safety) and reorder
        for col in expected_order:
            if col not in df.columns:
                df[col] = 0
                
        df = df[expected_order]
        
        return df

    def get_feature_order(self):
        # Must match train_models.py numeric_features + categorical_features logic
        # OR match the order CatBoost/Pipeline expects.
        # CatBoost was trained on:
        # ['Age', 'Gender', 'Current_Semester', 'CGPA', 'Attendance_Percentage', 
        #  'Failed_Courses', 'LMS_Login_Count', 'Assignment_Submission_Rate', 
        #  'Credits_Completed', 'Fee_Delay_Indicator', 'Family_Background_Score', 
        #  'Learning_Disability_Flag']
        # BUT we must double check one-hot encoding for others.
        # However, CatBoost handles cat features natively if passed as such.
        # The logic below matches the manual dataframe construction in train_models.py before splitting.
        
        return [
            'Age', 'Current_Semester', 'CGPA', 'Attendance_Percentage', 
            'Failed_Courses', 'LMS_Login_Count', 'Assignment_Submission_Rate', 
            'Credits_Completed', 'Fee_Delay_Indicator', 'Family_Background_Score', 
            'Learning_Disability_Flag', 'Gender'
        ]
