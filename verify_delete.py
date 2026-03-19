import requests
import json

BASE_URL = 'http://127.0.0.1:5001/api'

def test_delete_flow():
    # 1. Create a dummy intervention
    print("Creating dummy intervention...")
    intervention_data = {
        "student_id": "STU001",
        "title": "Test Delete",
        "type": "Test",
        "description": "To be deleted",
        "status": "Planned",
        "assigned_to": "Tester"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/interventions", json=intervention_data)
        if resp.status_code != 201:
            print(f"Failed to create intervention: {resp.status_code} {resp.text}")
            return
        
        data = resp.json()
        intervention_id = data.get('id')
        print(f"Created intervention with ID: {intervention_id}")
        
        # 2a. Verify it exists via GET
        print("Verifying existence via GET /interventions...")
        get_resp = requests.get(f"{BASE_URL}/interventions")
        if get_resp.status_code == 200:
            all_interventions = get_resp.json()
            # It returns a grouped dict: {'planned': [], 'inProgress': [], 'resolved': []}
            found = False
            for group_name, items in all_interventions.items():
                for item in items:
                    if item.get('id') == intervention_id:
                        print(f"Found intervention {intervention_id} in group '{group_name}'")
                        found = True
            if not found:
                print(f"WARNING: Intervention {intervention_id} NOT found in GET list!")
        
        # 2. Try to delete it
        print(f"Attempting to delete intervention {intervention_id}...")
        del_resp = requests.delete(f"{BASE_URL}/interventions/{intervention_id}")
        
        if del_resp.status_code == 200:
            print("Success! Intervention deleted.")
        else:
            print(f"Failed to delete: {del_resp.status_code} {del_resp.text}")
            
    except Exception as e:
        print(f"Exception occurred: {e}")

if __name__ == "__main__":
    test_delete_flow()
