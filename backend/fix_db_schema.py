import sqlite3
import os
import shutil
from datetime import datetime

DB_PATH = os.path.join("instance", "stayontrack.db")
BACKUP_DIR = "instance"

REQUIRED_COLUMNS = {
    "age": "INTEGER",
    "gender": "TEXT",
    "environment_score": "REAL DEFAULT 5.0",
    "family_environment_notes": "TEXT",
    "credits_completed": "INTEGER DEFAULT 0",
    "fee_delay_indicator": "INTEGER DEFAULT 0",
    "learning_disability_flag": "INTEGER DEFAULT 0",
    "lms_login_count": "INTEGER DEFAULT 0",
    "assignment_submission_rate": "REAL DEFAULT 0.0",
    "outstanding_fees_amount": "REAL DEFAULT 0.0",
    "fees_paid_status": "INTEGER DEFAULT 0",
    "transcript_path": "TEXT",
    "backlog_count": "INTEGER DEFAULT 0",
    "pca_component_1": "REAL",
    "pca_component_2": "REAL",
    "family_background_score": "INTEGER DEFAULT 5"
}

def migrate_db():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}. Creating via app initialization suggested.")
        return

    # Backup
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"student.db.{timestamp}.bak")
    try:
        shutil.copy2(DB_PATH, backup_path)
        print(f"Backed up DB to {backup_path}")
    except Exception as e:
        print(f"Backup failed: {e}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Get existing columns
        cursor.execute("PRAGMA table_info(student)")
        existing_cols = {row[1] for row in cursor.fetchall()}
        
        print(f"Existing columns: {existing_cols}")

        for col, dtype in REQUIRED_COLUMNS.items():
            if col not in existing_cols:
                print(f"Adding column: {col} ({dtype})")
                try:
                    cursor.execute(f"ALTER TABLE student ADD COLUMN {col} {dtype}")
                except sqlite3.OperationalError as e:
                    print(f"Error adding {col}: {e}")
            else:
                print(f"Column {col} already exists.")

        conn.commit()
        print("Migration completed successfully.")

    except Exception as e:
        print(f"Migration failed completely: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_db()
