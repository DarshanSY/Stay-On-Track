import sqlite3
import os
from werkzeug.security import generate_password_hash

# Path to database
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'stayontrack.db')

def migrate():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(student)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'password_hash' not in columns:
            print("Adding password_hash column...")
            cursor.execute("ALTER TABLE student ADD COLUMN password_hash VARCHAR(255)")
            print("Column added.")
        else:
            print("password_hash column already exists.")

        # Set default password for all students
        print("Setting default passwords...")
        default_hash = generate_password_hash("password123")
        cursor.execute("UPDATE student SET password_hash = ? WHERE password_hash IS NULL", (default_hash,))
        
        conn.commit()
        print("Migration complete. Default password is 'password123'.")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
