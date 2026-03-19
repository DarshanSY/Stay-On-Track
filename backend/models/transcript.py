from extensions import db
from datetime import datetime

class Transcript(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('student.student_id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    gpa_sem_wise = db.Column(db.JSON, nullable=True)  # Store as JSON: {"sem1": 8.5, "sem2": 8.0}
    credit_sem_wise = db.Column(db.JSON, nullable=True) # Store as JSON: {"sem1": 20, "sem2": 22}
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'file_path': self.file_path,
            'gpa_sem_wise': self.gpa_sem_wise,
            'credit_sem_wise': self.credit_sem_wise,
            'created_at': self.created_at.isoformat()
        }
