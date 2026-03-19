import requests
import os

def upload_file():
    url = 'http://127.0.0.1:5000/api/students/upload'
    file_path = 'sample_students.csv'
    
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    try:
        with open(file_path, 'rb') as f:
            files = {'file': (file_path, f, 'text/csv')}
            print(f"Uploading {file_path} to {url}...")
            response = requests.post(url, files=files)
            
        print(f"Status Code: {response.status_code}")
        print("Response:", response.json())
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    upload_file()
