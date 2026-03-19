import requests
import json

# Get all students
response = requests.get('http://localhost:5000/api/students')
students = response.json()

# Find STU900X students and delete them
deleted = 0
for s in students:
    if s.get('student_id', '').startswith('STU900'):
        student_id = s.get('id')
        print(f"Deleting {s.get('student_id')} (ID: {student_id})...")
        del_response = requests.delete(f'http://localhost:5000/api/students/{student_id}')
        if del_response.status_code == 200:
            deleted += 1
            print(f"  ✓ Deleted")
        else:
            print(f"  ✗ Failed: {del_response.status_code}")

print(f"\nTotal deleted: {deleted} students")
