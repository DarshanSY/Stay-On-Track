import pandas as pd
import numpy as np
import random

def generate_student_data(num_students=1000):
    np.random.seed(42)
    random.seed(42)
    
    data = []
    
    for i in range(num_students):
        student_id = f"STU{2024000+i}"
        
        # Demographics
        age = random.randint(18, 25)
        gender = random.choice(['Male', 'Female'])
        
        # Academics
        current_semester = random.randint(1, 8)
        cgpa = np.round(np.random.normal(7.5, 1.5), 2)
        cgpa = max(min(cgpa, 10.0), 0.0) # Clip between 0 and 10
        
        attendance = np.round(np.random.normal(75, 15), 1)
        attendance = max(min(attendance, 100.0), 0.0)
        
        failed_courses = 0
        if cgpa < 5.0 or attendance < 60:
             failed_courses = np.random.poisson(1)
        
        credits_completed = (current_semester - 1) * 20 + random.randint(0, 20)
        
        # Financial & Background
        fee_delay_indicator = random.choice([0, 1]) if random.random() < 0.2 else 0
        family_background_score = random.randint(1, 10) # 1 = low resource, 10 = high resource
        learning_disability_flag = 1 if random.random() < 0.05 else 0

        # LMS Activity
        lms_login_count = int(np.random.normal(50, 20))
        lms_login_count = max(0, lms_login_count)
        
        assignment_submission_rate = np.random.beta(5, 2) # Skewed towards 1
        assignment_submission_rate = round(assignment_submission_rate * 100, 1)
        
        # Target: Dropout Risk (Synthetic Logic)
        # High risk if low CGPA, low attendance, or many fails
        risk_prob = 0.1
        if cgpa < 5.0: risk_prob += 0.3
        if attendance < 60: risk_prob += 0.2
        if failed_courses > 1: risk_prob += 0.15
        if lms_login_count < 20: risk_prob += 0.1
        if fee_delay_indicator == 1: risk_prob += 0.1
        if family_background_score < 3: risk_prob += 0.1
        if learning_disability_flag == 1: risk_prob += 0.05
        
        risk_prob = min(risk_prob, 0.95)
        is_dropout = 1 if random.random() < risk_prob else 0
        
        data.append({
            'Student_ID': student_id,
            'Age': age,
            'Gender': gender,
            'Current_Semester': current_semester,
            'CGPA': cgpa,
            'Attendance_Percentage': attendance,
            'Failed_Courses': failed_courses,
            'Credits_Completed': credits_completed,
            'Fee_Delay_Indicator': fee_delay_indicator,
            'Family_Background_Score': family_background_score,
            'Learning_Disability_Flag': learning_disability_flag,
            'LMS_Login_Count': lms_login_count,
            'Assignment_Submission_Rate': assignment_submission_rate,
            'Dropout_Status': is_dropout
        })
        
    df = pd.DataFrame(data)
    df.to_csv('student_dropout_data.csv', index=False)
    print(f"Generated {num_students} student records.")
    return df

if __name__ == "__main__":
    generate_student_data()
