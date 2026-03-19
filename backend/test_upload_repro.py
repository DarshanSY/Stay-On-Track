
import requests
import os

def test_upload():
    # Create a dummy CSV file
    csv_content = "student_id,name,current_semester,cgpa\nSTU999,Test Student,1,9.0"
    with open("test.csv", "w") as f:
        f.write(csv_content)

    url = "http://127.0.0.1:5000/api/students/upload"
    files = {'file': ('test.csv', open('test.csv', 'rb'), 'text/csv')}
    
    print(f"Attempting upload to {url}...")
    try:
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Upload failed: {e}")
    finally:
        files['file'][1].close()
        os.remove("test.csv")

    # Also try with the LAN IP if possible to simulate cross-origin/network access
    # Assuming the user's IP from previous context
    lan_ip = "10.201.9.19"
    url_lan = f"http://{lan_ip}:5000/api/students/upload"
    
    # Re-create file for second attempt
    with open("test.csv", "w") as f:
        f.write(csv_content)
    files_lan = {'file': ('test.csv', open('test.csv', 'rb'), 'text/csv')}

    print(f"\nAttempting upload to {url_lan}...")
    try:
        response = requests.post(url_lan, files=files_lan)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Upload failed to LAN IP: {e}")
    finally:
        files_lan['file'][1].close()
        os.remove("test.csv")

if __name__ == "__main__":
    test_upload()
