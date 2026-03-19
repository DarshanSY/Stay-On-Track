from app import create_app
from extensions import db
from models.student import Student
from werkzeug.security import generate_password_hash

app = create_app()

def fix_passwords():
    with app.app_context():
        print("Starting password fix...")
        students = Student.query.all()
        count = 0
        default_password = 'password123'
        
        # We can just update all of them to be sure
        for student in students:
            # You can check if hash is missing, or just force update all
            # For consistency, let's force update all to 'password123'
            student.set_password(default_password)
            count += 1
            
        try:
            db.session.commit()
            print(f"Successfully updated passwords for {count} students to '{default_password}'.")
        except Exception as e:
            db.session.rollback()
            print(f"Error updating passwords: {e}")

if __name__ == "__main__":
    fix_passwords()
