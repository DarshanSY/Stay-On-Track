from extensions import db
from datetime import datetime

class FeesHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('student.student_id'), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    total_fees = db.Column(db.Float, nullable=False)
    fees_paid = db.Column(db.Float, nullable=False, default=0.0)
    pending_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="PENDING") # PAID, PARTIAL, PENDING
    payment_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'semester': self.semester,
            'total_fees': self.total_fees,
            'fees_paid': self.fees_paid,
            'pending_amount': self.pending_amount,
            'status': self.status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'created_at': self.created_at.isoformat()
        }
