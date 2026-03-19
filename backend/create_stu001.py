import sqlite3
import os
from werkzeug.security import generate_password_hash

db_path = 'instance/stayontrack.db'
if not os.path.exists(db_path):
    if os.path.exists('stayontrack.db'):
        db_path = 'stayontrack.db'

print(f"Updating database at: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Generate hash
    p_hash = generate_password_hash('password123')
    
    # Insert STU001
    # Check if exists first
    cursor.execute("SELECT id FROM student WHERE student_id = 'STU001'")
    if cursor.fetchone():
        print("STU001 already exists (unexpected). Updating password...")
        cursor.execute("UPDATE student SET password_hash = ? WHERE student_id = 'STU001'", (p_hash,))
    else:
        print("Inserting STU001...")
        # Minimal fields based on model
        cursor.execute("""
            INSERT INTO student (
                name, student_id, age, gender, cgpa, attendance_percentage, 
                current_semester, risk_score, risk_category, password_hash
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'Student 1', 'STU001', 20, 'Male', 8.5, 90.0, 
            4, 10.0, 'Low', p_hash
        ))
        
    conn.commit()
    print("STU001 created/updated successfully.")
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
