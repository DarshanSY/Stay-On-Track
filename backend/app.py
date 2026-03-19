from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config

from extensions import db




def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS - Allow all origins for development
    CORS(app)

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    from api.routes import main_bp
    from api.explainability import explain_bp
    from api.fees import fees_bp
    from api.transcript import transcript_bp
    app.register_blueprint(main_bp, url_prefix='/api')
    app.register_blueprint(explain_bp, url_prefix='/api/explain')
    app.register_blueprint(fees_bp, url_prefix='/api/fees')
    app.register_blueprint(transcript_bp, url_prefix='/api/transcript')

    # Create database tables
    with app.app_context():
        from models.user import User
        from models.student import Student
        from models.intervention import Intervention
        from models.lms import LMSLogs
        from models.lms import LMSLogs
        from models.alert import Alert
        from models.transcript import Transcript
        from models.fees import FeesHistory
        db.create_all()
        
        # Seed data if empty
        try:
            if Student.query.count() == 0:
                print("Seeding database with initial students...")
                # Create some dummy students
                students = [
                    Student(name="Student 1", student_id="STU001", age=20, gender="Male", cgpa=8.5, 
                            attendance_percentage=90.0, current_semester=4, risk_score=10.0, risk_category="Low",
                            credits_completed=60, fee_delay_indicator=0, family_background_score=8, learning_disability_flag=0,
                            lms_login_count=80, assignment_submission_rate=95.0),
                    Student(name="Student 2", student_id="STU002", age=21, gender="Female", cgpa=6.2, 
                            attendance_percentage=75.0, current_semester=4, risk_score=45.0, risk_category="Medium",
                            credits_completed=55, fee_delay_indicator=1, family_background_score=4, learning_disability_flag=0,
                            lms_login_count=40, assignment_submission_rate=70.0),
                    Student(name="Student 3", student_id="STU003", age=22, gender="Male", cgpa=4.5, 
                            attendance_percentage=60.0, current_semester=6, risk_score=85.0, risk_category="High",
                            credits_completed=40, fee_delay_indicator=1, family_background_score=2, learning_disability_flag=1,
                            lms_login_count=15, assignment_submission_rate=40.0),
                    Student(name="Critical Student", student_id="STU006", age=23, gender="Male", cgpa=3.5, 
                            attendance_percentage=40.0, current_semester=5, risk_score=92.0, risk_category="Critical",
                            credits_completed=30, fee_delay_indicator=1, family_background_score=3, learning_disability_flag=0,
                            lms_login_count=5, assignment_submission_rate=20.0),
                ]
                
                # Set default passwords
                for s in students:
                    s.set_password('password123')
                    
                db.session.bulk_save_objects(students)
                
                # Seed Interventions
                interventions = [
                    Intervention(student_id="STU006", title="Academic Counseling", type="Academic", status="Planned", assigned_to="Dr. Smith"),
                    Intervention(student_id="STU003", title="Attendance Warning", type="Administrative", status="In Progress", assigned_to="Admin"),
                ]
                db.session.bulk_save_objects(interventions)
                
                # Seed Alerts
                alerts = [
                    Alert(message="High risk detected for STU006", type="Risk", is_read=False),
                    Alert(message="LMS Connection Established", type="System", is_read=True)
                ]
                db.session.bulk_save_objects(alerts)
                
                db.session.commit()
                print("Seeding complete.")
        except Exception as e:
            print(f"Seeding failed: {e}")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000, host='0.0.0.0')
    # Trigger reload - Update 3
