import sqlite3
import os

# Assuming SQLite default
db_path = 'instance/stayontrack.db'
if not os.path.exists(db_path):
    # Try looking in root or other places
    if os.path.exists('stayontrack.db'):
        db_path = 'stayontrack.db'
    else:
        print(f"Database not found at {db_path} or stayontrack.db")
        exit(1)

print(f"Checking database at: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if student table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='student';")
    if not cursor.fetchone():
        print("Table 'student' does not exist.")
        exit(1)

    # List all students
    cursor.execute("SELECT student_id, name FROM student")
    rows = cursor.fetchall()
    print(f"Total students found: {len(rows)}")
    for r in rows:
        print(r)
        
    cursor.execute("SELECT student_id, password_hash FROM student WHERE student_id = 'STU001'")
    row = cursor.fetchone()
    
    if row:
        sid, phash = row
        print(f"Found Student: {sid}")
        print(f"Password Hash: {phash if phash else 'NULL'}")
        
        # We can't easily check the hash without werkzeug, but we can see if it's there.
        # If it's NULL, that's the problem.
    else:
        print("Student STU001 not found.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
