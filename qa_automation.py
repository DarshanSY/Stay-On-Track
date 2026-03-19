
import subprocess
import requests
import time
import os
import sys
import json
import shutil
from datetime import datetime

# --- Configuration ---
BACKEND_DIR = "backend"
FRONTEND_DIR = "frontend"
ML_DIR = "ml_engine"
ARTIFACTS_DIR = "qa_artifacts"
API_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:3000"

# --- Report Data ---
report_data = {
    "summary": [],
    "features": {
        "working": [],
        "broken": []
    },
    "api_results": [],
    "ui_results": [],
    "ml_results": [],
    "final_verdict": "PENDING"
}

def log(message):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
    with open(f"{ARTIFACTS_DIR}/logs/automation.log", "a") as f:
        f.write(f"[{datetime.now().strftime('%H:%M:%S')}] {message}\n")

def ensure_directories():
    dirs = [
        ARTIFACTS_DIR,
        f"{ARTIFACTS_DIR}/logs",
        f"{ARTIFACTS_DIR}/screenshots",
        f"{ARTIFACTS_DIR}/reports",
        f"{ARTIFACTS_DIR}/api_responses"
    ]
    for d in dirs:
        if not os.path.exists(d):
            os.makedirs(d)
    log("Artifact directories created.")

def start_backend():
    log("Starting Backend...")
    log_file = open(f"{ARTIFACTS_DIR}/logs/backend.log", "w")
    proc = subprocess.Popen(
        [sys.executable, "app.py"],
        cwd=BACKEND_DIR,
        stdout=log_file,
        stderr=subprocess.STDOUT
    )
    return proc

def start_frontend():
    log("Starting Frontend...")
    log_file = open(f"{ARTIFACTS_DIR}/logs/frontend.log", "w")
    # Use shell=True for npm on Windows to resolve paths correctly if needed, or stick to cmd /c
    cmd = ["npm", "run", "dev"]
    if os.name == 'nt': 
        cmd = ["cmd", "/c", "npm", "run", "dev"]
        
    proc = subprocess.Popen(
        cmd,
        cwd=FRONTEND_DIR,
        stdout=log_file,
        stderr=subprocess.STDOUT
    )
    return proc

def wait_for_service(url, name, max_retries=60):
    log(f"Waiting for {name} at {url}...")
    for i in range(max_retries):
        try:
            requests.get(url, timeout=2)
            log(f"{name} is UP!")
            return True
        except:
            time.sleep(2)
            if i % 10 == 0: log(f"Still waiting for {name}...")
    log(f"{name} failed to start.")
    return False

def test_api_endpoints():
    log("Running API Test Suite...")
    
    # 1. Get a student ID to use
    student_id = "STU001" # Default from seeding
    
    tests = [
        # ML Prediction
        {"name": "Predict CatBoost", "method": "POST", "url": "/api/predict", "payload": {"model_type": "catboost", "student_id": student_id, "features": {}}}, 
        {"name": "Predict Neural", "method": "POST", "url": "/api/predict", "payload": {"model_type": "neural", "student_id": student_id, "features": {}}},
        
        # Temporal
        {"name": "Temporal Attendance", "method": "GET", "url": f"/api/temporal/attendance/{student_id}"},
        {"name": "Temporal GPA", "method": "GET", "url": f"/api/temporal/gpa/{student_id}"},
        
        # Explainability
        {"name": "Explain SHAP", "method": "GET", "url": f"/api/explain/shap?id={student_id}"},
        {"name": "Explain LIME", "method": "GET", "url": f"/api/explain/lime?id={student_id}"},
        
        # Fees
        {"name": "Fees Pending", "method": "GET", "url": "/api/fees/pending"},
        
        # Alerts
        {"name": "Alerts", "method": "GET", "url": "/api/alerts"},
        
        # Health
        {"name": "Health", "method": "GET", "url": "/api/health"},
    ]
    
    for test in tests:
        full_url = f"{API_URL}{test['url']}"
        status = "FAIL"
        details = ""
        try:
            if test['method'] == 'POST':
                resp = requests.post(full_url, json=test.get('payload', {}), timeout=5)
            else:
                resp = requests.get(full_url, timeout=5)
            
            # Save response
            fname = test['name'].replace(' ', '_').lower() + ".json"
            with open(f"{ARTIFACTS_DIR}/api_responses/{fname}", "w") as f:
                try:
                    json.dump(resp.json(), f, indent=2)
                except:
                    f.write(resp.text)

            if resp.status_code in [200, 201]:
                status = "PASS"
            else:
                details = f"Status {resp.status_code}"
                
        except Exception as e:
            details = str(e)
        
        log(f"API Test: {test['name']} -> {status} {details}")
        report_data["api_results"].append(f"| {test['name']} | {status} | {details} |")
        
        if status == "PASS":
            report_data["features"]["working"].append(f"API: {test['name']}")
        else:
            report_data["features"]["broken"].append({
                "what": f"API: {test['name']}",
                "where": test['url'],
                "evidence": details
            })

def run_playwright():
    log("Running Playwright Tests...")
    try:
        cmd = ["npx", "playwright", "test", "tests/qa_complete.spec.ts"]
        if os.name == 'nt': cmd = ["cmd", "/c"] + cmd
        
        result = subprocess.run(
            cmd,
            cwd=FRONTEND_DIR,
            capture_output=True,
            text=True
        )
        
        with open(f"{ARTIFACTS_DIR}/logs/playwright.log", "w") as f:
            f.write(result.stdout)
            f.write(result.stderr)
            
        if result.returncode == 0:
            log("Playwright Tests Passed.")
            report_data["ui_results"].append("All Playwright UI tests PASSED.")
            report_data["features"]["working"].append("Frontend UI Flows")
        else:
            log("Playwright Tests Failed.")
            report_data["ui_results"].append("Some Playwright UI tests FAILED. See logs.")
            report_data["features"]["broken"].append({
                "what": "UI Tests",
                "where": "Frontend",
                "evidence": "See playwright.log"
            })
    except Exception as e:
        log(f"Playwright execution error: {e}")

def run_ml_pipeline():
    log("Running ML Pipeline...")
    
    # 1. Dataset Gen
    try:
        log("Generating Dataset...")
        subprocess.run([sys.executable, "dataset_generator.py"], cwd=ML_DIR, check=True)
        report_data["ml_results"].append("Dataset Generator: PASS")
    except Exception as e:
        log(f"Dataset Gen Failed: {e}")
        report_data["ml_results"].append(f"Dataset Generator: FAIL ({e})")
        
    # 2. Training
    try:
        log("Training Models...")
        with open(f"{ARTIFACTS_DIR}/train_models.log", "w") as f:
            subprocess.run([sys.executable, "train_models.py"], cwd=ML_DIR, check=True, stdout=f, stderr=subprocess.STDOUT)
        report_data["ml_results"].append("Model Training: PASS")
        report_data["features"]["working"].append("ML Training Pipeline")
    except Exception as e:
        log(f"Training Failed: {e}")
        report_data["ml_results"].append(f"Model Training: FAIL ({e})")
        report_data["features"]["broken"].append({
            "what": "ML Training",
            "where": "ml_engine/train_models.py",
            "evidence": str(e)
        })

def generate_report():
    log("Generating Report...")
    
    # Determine verdict
    broken_count = len(report_data["features"]["broken"])
    verdict = "PASS" if broken_count == 0 else "FAIL"
    
    md = f"""# StayOnTrack – Complete Feature QA Report
Generated: {datetime.now()}

## Summary Table
| Module | Status | Notes |
|---|---|---|
| Backend API | {"FAIL" if any("FAIL" in r for r in report_data["api_results"]) else "PASS"} | |
| Frontend UI | {"FAIL" if "FAILED" in str(report_data["ui_results"]) else "PASS"} | |
| ML Engine | {"FAIL" if any("FAIL" in r for r in report_data["ml_results"]) else "PASS"} | |

## Final Verdict
**{verdict}**

## API Test Results
| Endpoint | Status | Details |
|---|---|---|
{chr(10).join(report_data["api_results"])}

## ML Model Results
{chr(10).join([f"- {r}" for r in report_data["ml_results"]])}

## UI Results
{chr(10).join([f"- {r}" for r in report_data["ui_results"]])}

## Broken / Missing Features
"""
    for item in report_data["features"]["broken"]:
        md += f"""
### {item['what']}
- **Where**: {item['where']}
- **Evidence**: {item.get('evidence', 'N/A')}
"""

    if not report_data["features"]["broken"]:
        md += "\n*None detected.*\n"

    with open("QA_REPORT.md", "w") as f:
        f.write(md)
    log("QA_REPORT.md generated.")

def main():
    try:
        ensure_directories()
        
        be_proc = start_backend()
        fe_proc = start_frontend()
        
        if wait_for_service(f"{API_URL}/api/health", "Backend"):
            test_api_endpoints()
        else:
            log("Skipping API tests due to backend failure.")
            
        if wait_for_service(FRONTEND_URL, "Frontend"):
            run_playwright()
        else:
            log("Skipping UI tests due to frontend failure.")
            
        run_ml_pipeline()
        
        generate_report()
        
    finally:
        log("Cleaning up...")
        try:
            be_proc.terminate()
            fe_proc.terminate()
            if os.name == 'nt':
                # Force kill python and node to be safe on windows
                subprocess.run(["taskkill", "/F", "/IM", "python.exe"], stderr=subprocess.DEVNULL)
                subprocess.run(["taskkill", "/F", "/IM", "node.exe"], stderr=subprocess.DEVNULL)
        except:
            pass
        log("Done.")

if __name__ == "__main__":
    main()
