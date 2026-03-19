import unittest
import requests
import json
import time

class TestPredictionFlow(unittest.TestCase):
    BASE_URL = "http://localhost:5000/api"

    def test_ensemble_prediction_logic(self):
        """Test that ensemble returns sensible probabilities and correct model_used tag."""
        payload = {
            "model_type": "ensemble",
            "Attendance": 100,
            "CGPA": 9.0,
            "Current Semester": 4,
            "Age": 21,
            "Gender": "Male",
            "Credits_Completed": 60,
            "Fee_Delay_Indicator": 0,
            "Family_Background_Score": 8,
            "Learning_Disability_Flag": 0,
            "LMS_Login_Count": 50,
            "Assignment_Submission_Rate": 90
        }
        
        response = requests.post(f"{self.BASE_URL}/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check contract
        self.assertIn("probability", data)
        self.assertIn("model_used", data)
        self.assertEqual(data["model_used"], "ensemble")
        
        # Check logic (Good student -> Low risk)
        self.assertLess(data["probability"], 0.3, "Good student should have low risk probability")
        
    def test_engine_selection(self):
        """Test that specific engines are respected."""
        engines = ["logistic", "neural", "catboost"]
        for engine in engines:
            payload = {
                "model_type": engine,
                "Attendance": 80,
                "CGPA": 7.5,
                "Current Semester": 4
            }
            response = requests.post(f"{self.BASE_URL}/predict", json=payload)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["model_used"], engine)

    def test_bad_student_risk(self):
        """Test high risk student."""
        payload = {
            "model_type": "ensemble",
            "Attendance": 30,
            "CGPA": 4.0,
            "Current Semester": 4,
            "Failed_Courses": 2
        }
        response = requests.post(f"{self.BASE_URL}/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["probability"], 0.5, "Bad student should have high risk probability")

if __name__ == "__main__":
    unittest.main()
