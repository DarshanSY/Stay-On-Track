import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    print("Importing MLService...")
    from services.ml_service import MLService
    print("Initializing MLService...")
    ml_service = MLService()
    print("MLService Initialized successfully.")
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
