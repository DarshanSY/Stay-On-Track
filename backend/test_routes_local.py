
from app import create_app
import pytest

app = create_app()
client = app.test_client()

def test_routes():
    print("Testing /api/students/006...")
    try:
        response = client.get('/api/students/006')
        print(f"Status: {response.status_code}")
        print(f"Data: {response.get_data(as_text=True)}")
    except Exception as e:
        print(f"Error: {e}")

    print("\nTesting /api/students/STU006...")
    try:
        response = client.get('/api/students/STU006')
        print(f"Status: {response.status_code}")
        print(f"Data: {response.get_data(as_text=True)}")
    except Exception as e:
        print(f"Error: {e}")

    print("\nTesting /api/students (List)...")
    try:
        response = client.get('/api/students')
        print(f"Status: {response.status_code}")
        print(f"Data: {response.get_data(as_text=True)[:100]}...")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    with app.app_context():
        test_routes()
