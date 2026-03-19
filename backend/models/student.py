from flask_sqlalchemy import SQLAlchemy
from extensions import db

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    
    # Demographics
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    
    # Academics
    cgpa = db.Column(db.Float)
    attendance_percentage = db.Column(db.Float)
    failed_courses = db.Column(db.Integer, default=0)
    current_semester = db.Column(db.Integer)
    
    # LMS & Risk
    lms_activity_score = db.Column(db.Float, default=0.0) # Aggregate score
    lms_login_count = db.Column(db.Integer, default=0)
    assignment_submission_rate = db.Column(db.Float, default=0.0)
    
    # New Features
    credits_completed = db.Column(db.Integer, default=0)
    fee_delay_indicator = db.Column(db.Integer, default=0) # 0 or 1
    family_background_score = db.Column(db.Integer, default=5)
    learning_disability_flag = db.Column(db.Integer, default=0)

    # Database Upgrade - New Columns
    fees_paid_status = db.Column(db.Integer, default=0) # 0: Pending, 1: Paid
    outstanding_fees_amount = db.Column(db.Float, default=0.0)
    transcript_path = db.Column(db.String(255), nullable=True)
    backlog_count = db.Column(db.Integer, default=0)
    environment_score = db.Column(db.Float, default=5.0) # 1-10
    family_environment_notes = db.Column(db.Text, nullable=True)
    pca_component_1 = db.Column(db.Float, nullable=True)
    pca_component_2 = db.Column(db.Float, nullable=True)

    risk_score = db.Column(db.Float) # Predicted probability, default model
    risk_category = db.Column(db.String(20)) # Low, Medium, High

    # Authentication
    password_hash = db.Column(db.String(255))

    def set_password(self, password):
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        from werkzeug.security import check_password_hash, generate_password_hash
        if not self.password_hash:
             # Fallback for legacy users without password: check if password matches student_id
             # In production this should be forced update
             return password == self.student_id
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'student_id': self.student_id,
            'age': self.age,
            'gender': self.gender,
            'cgpa': self.cgpa,
            'attendance_percentage': self.attendance_percentage,
            'failed_courses': self.failed_courses,
            'current_semester': self.current_semester,
            'lms_activity_score': self.lms_activity_score,
            'lms_login_count': self.lms_login_count,
            'assignment_submission_rate': self.assignment_submission_rate,
            'credits_completed': self.credits_completed,
            'fee_delay_indicator': self.fee_delay_indicator,
            'family_background_score': self.family_background_score,
            'learning_disability_flag': self.learning_disability_flag,
            
            # New Fields
            'fees_paid_status': self.fees_paid_status,
            'outstanding_fees_amount': self.outstanding_fees_amount,
            'transcript_path': self.transcript_path,
            'backlog_count': self.backlog_count,
            'environment_score': self.environment_score,
            'family_environment_notes': self.family_environment_notes,
            'pca_component_1': self.pca_component_1,
            'pca_component_2': self.pca_component_2,

            'risk_score': self.risk_score,
            'risk_category': self.risk_category
        }
