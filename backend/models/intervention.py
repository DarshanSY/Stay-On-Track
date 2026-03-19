from extensions import db
from datetime import datetime

class Intervention(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), db.ForeignKey('student.student_id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(50), nullable=False) # Academic, Personal, etc.
    description = db.Column(db.Text)
    date = db.Column(db.Date, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Planned') # Planned, In Progress, Resolved
    assigned_to = db.Column(db.String(100)) # Counselor/Teacher name

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'title': self.title,
            'type': self.type,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'status': self.status,
            'assigned_to': self.assigned_to
        }
