"""
Test script to verify CSV upload with improved error handling
"""
import requests
import os

base_url = 'http://localhost:5000/api'

def test_valid_csv():
    """Test uploading a valid CSV file"""
    print("\n=== Test 1: Valid CSV Upload ===")
    url = f'{base_url}/students/upload'
    csv_path = r'c:\Users\darsh\OneDrive\Desktop\student-ai\test_upload.csv'
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return
    
    with open(csv_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✓ Valid CSV upload successful!")
        else:
            print("✗ Valid CSV upload failed!")

def test_missing_file():
    """Test uploading without a file"""
    print("\n=== Test 2: Missing File ===")
    url = f'{base_url}/students/upload'
    response = requests.post(url)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 400 and 'No file provided' in response.json().get('error', ''):
        print("✓ Missing file error handled correctly!")
    else:
        print("✗ Missing file error not handled correctly!")

def test_invalid_format():
    """Test uploading a non-CSV file"""
    print("\n=== Test 3: Invalid File Format ===")
    url = f'{base_url}/students/upload'
    
    # Create a temporary text file
    temp_file = r'c:\Users\darsh\OneDrive\Desktop\student-ai\temp_test.txt'
    with open(temp_file, 'w') as f:
        f.write('This is not a CSV')
    
    try:
        with open(temp_file, 'rb') as f:
            files = {'file': ('test.txt', f)}
            response = requests.post(url, files=files)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 400 and 'Invalid file type' in response.json().get('error', ''):
                print("✓ Invalid format error handled correctly!")
            else:
                print("✗ Invalid format error not handled correctly!")
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

def test_invalid_csv_content():
    """Test uploading CSV with missing Student ID column"""
    print("\n=== Test 4: CSV Missing Required Column ===")
    url = f'{base_url}/students/upload'
    
    # Create a CSV without Student ID column
    temp_csv = r'c:\Users\darsh\OneDrive\Desktop\student-ai\temp_invalid.csv'
    with open(temp_csv, 'w') as f:
        f.write('Name,Age,Grade\nJohn Doe,20,A\n')
    
    try:
        with open(temp_csv, 'rb') as f:
            files = {'file': f}
            response = requests.post(url, files=files)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 400 and 'Student ID' in response.json().get('error', ''):
                print("✓ Missing column error handled correctly!")
            else:
                print("✗ Missing column error not handled correctly!")
    finally:
        if os.path.exists(temp_csv):
            os.remove(temp_csv)

if __name__ == '__main__':
    print("Testing CSV Upload Functionality")
    print("=" * 50)
    
    test_valid_csv()
    test_missing_file()
    test_invalid_format()
    test_invalid_csv_content()
    
    print("\n" + "=" * 50)
    print("All tests completed!")
