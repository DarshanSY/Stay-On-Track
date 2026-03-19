import pytest
import requests
import time
import sys

BASE_URL = "http://localhost:5000"

def wait_for_server():
    max_retries = 30
    for i in range(max_retries):
        try:
            # Try both root and api health
            try:
                requests.get(BASE_URL, timeout=1)
                return
            except:
                pass
            
            requests.get(f"{BASE_URL}/api/health", timeout=1)
            return
        except requests.exceptions.ConnectionError:
            time.sleep(1)
            continue
        except Exception:
             time.sleep(1)
             continue
    # If we get here, it might just be that the endpoints are 404ing but server is up, 
    # or server is down. We'll proceed to tests to fail there if needed.
    print("Server wait timeout or server ready.")

@pytest.fixture(scope="session", autouse=True)
def setup_server():
    wait_for_server()

def test_health_check():
    """GET / or /api/health (probe both) => expect 200 and JSON with a status key"""
    success = False
    errors = []
    
    for endpoint in ["/", "/api/health"]:
        url = f"{BASE_URL}{endpoint}"
        try:
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                try:
                    data = resp.json()
                    if "status" in data:
                        success = True
                        break
                except ValueError:
                    errors.append(f"{endpoint} returned 200 but not JSON")
            else:
                errors.append(f"{endpoint} returned {resp.status_code}")
        except Exception as e:
            errors.append(f"{endpoint} failed: {e}")
            
    if not success:
        pytest.fail(f"Health check failed. Errors: {errors}")

def test_predict_endpoint():
    """POST /predict (probe both /predict and /api/predict)."""
    payload = {
        "attendance_percentage": 75.0,
        "cgpa": 7.2,
        "semester": 5
    }
    
    success = False
    errors = []
    
    for endpoint in ["/predict", "/api/predict"]:
        url = f"{BASE_URL}{endpoint}"
        try:
            resp = requests.post(url, json=payload, timeout=5)
            if resp.status_code in [200, 201]:
                try:
                    data = resp.json()
                    if "probability" in data or "risk_band" in data:
                        success = True
                        break
                    else:
                        errors.append(f"{endpoint} missing keys in {data}")
                except ValueError:
                    errors.append(f"{endpoint} returned {resp.status_code} but not JSON")
            else:
                errors.append(f"{endpoint} returned {resp.status_code}: {resp.text}")
        except Exception as e:
            errors.append(f"{endpoint} failed: {e}")
            
    if not success:
         pytest.fail(f"Prediction API failed. Errors: {errors}")
