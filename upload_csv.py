import requests

# Upload the CSV file
url = "http://localhost:5000/api/students/upload"
files = {'file': open('sample_student_upload.csv', 'rb')}

print("Uploading CSV...")
response = requests.post(url, files=files)

print(f"\nStatus Code: {response.status_code}")
print(f"Response: {response.json()}")

files['file'].close()
