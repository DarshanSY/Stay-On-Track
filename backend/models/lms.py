from datetime import datetime
from extensions import db

class LMSLogs(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), db.ForeignKey('student.student_id'), nullable=False)
    month = db.Column(db.String(20)) # e.g., "2024-01"
    login_count = db.Column(db.Integer, default=0)
    assignments_submitted = db.Column(db.Integer, default=0)
    avg_score = db.Column(db.Float, default=0.0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'month': self.month,
            'login_count': self.login_count,
            'assignments_submitted': self.assignments_submitted,
            'avg_score': self.avg_score
        }
