try:
    from backend.app import create_app
    print("Import successful")
except Exception as e:
    print(f"Import failed: {e}")
