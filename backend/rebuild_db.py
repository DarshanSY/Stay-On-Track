import os
import shutil
from datetime import datetime

DB_PATH = os.path.join("instance", "stayontrack.db")

def rebuild():
    if os.path.exists(DB_PATH):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup = f"{DB_PATH}.{timestamp}.rebuild.bak"
        try:
            shutil.move(DB_PATH, backup)
            print(f"Moved {DB_PATH} to {backup}")
        except Exception as e:
            print(f"Failed to move DB: {e}")
    else:
        print(f"{DB_PATH} does not exist.")

if __name__ == "__main__":
    rebuild()
