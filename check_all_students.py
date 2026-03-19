import requests
import json

# Get all students
response = requests.get('http://localhost:5000/api/students')
print("Status Code:", response.status_code)
students = response.json()

# Filter for STU900X students
stu900_students = [s for s in students if s.get('student_id', '').startswith('STU900')]
print(f"\nFound {len(stu900_students)} students with STU900X IDs:")
for s in stu900_students:
    print(f"\nStudent ID: {s.get('student_id')}")
    print(f"  Name: {s.get('name')}")
    print(f"  Risk Score: {s.get('risk_score')}")
    print(f"  Risk Category: {s.get('risk_category')}")
