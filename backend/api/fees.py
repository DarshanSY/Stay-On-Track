from flask import Blueprint, jsonify, request
from extensions import db
from models.student import Student
from models.fees import FeesHistory
from datetime import datetime

fees_bp = Blueprint('fees', __name__)

@fees_bp.route('/<student_id>', methods=['GET'])
def get_student_fees(student_id):
    """Get fee history for a student."""
    try:
        # Check if student exists
        student = Student.query.filter_by(student_id=student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404
            
        history = FeesHistory.query.filter_by(student_id=student_id).order_by(FeesHistory.semester.desc()).all()
        
        # Summary
        total_pending = sum(h.pending_amount for h in history)
        
        return jsonify({
            "student_id": student.student_id,
            "name": student.name,
            "total_pending": total_pending,
            "history": [h.to_dict() for h in history]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@fees_bp.route('/pending', methods=['GET'])
def get_pending_fees():
    """Get all students with pending fees."""
    try:
        pending_records = FeesHistory.query.filter(FeesHistory.pending_amount > 0).all()
        
        # Group by student
        result = {}
        for record in pending_records:
            if record.student_id not in result:
                student = Student.query.filter_by(student_id=record.student_id).first()
                result[record.student_id] = {
                    "student_id": record.student_id,
                    "name": student.name if student else "Unknown",
                    "total_pending": 0,
                    "details": []
                }
            
            result[record.student_id]["total_pending"] += record.pending_amount
            result[record.student_id]["details"].append(record.to_dict())
            
        return jsonify(list(result.values()))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@fees_bp.route('/update', methods=['POST'])
def update_fee_status():
    """Update fee payment."""
    try:
        data = request.json
        student_id = data.get('student_id')
        semester = data.get('semester')
        amount_paid = data.get('amount_paid')
        
        record = FeesHistory.query.filter_by(student_id=student_id, semester=semester).first()
        
        if not record:
            # Create new record if not exists (or error? assuming we pay existing dues)
            # Let's create one if it doesn't exist for flexibility
            total_fees = data.get('total_fees', 50000) # Default fees
            record = FeesHistory(
                student_id=student_id,
                semester=semester,
                total_fees=total_fees,
                fees_paid=0,
                pending_amount=total_fees,
                status="PENDING"
            )
            db.session.add(record)
            
        record.fees_paid += float(amount_paid)
        record.pending_amount = max(0, record.total_fees - record.fees_paid)
        record.payment_date = datetime.utcnow()
        
        if record.pending_amount == 0:
            record.status = "PAID"
        elif record.fees_paid > 0:
            record.status = "PARTIAL"
            
        # Update Student table summary fields
        student = Student.query.filter_by(student_id=student_id).first()
        if student:
            # Re-calculate total outstanding
            all_records = FeesHistory.query.filter_by(student_id=student_id).all()
            total_outstanding = sum(r.pending_amount for r in all_records) + record.pending_amount - (record.pending_amount if record in all_records else 0) # Logic fix needed if record is new but not yet queried
            # Actually easier to commit first or sum carefully.
            # Let's just sum AFTER commit or simpler:
            student.outstanding_fees_amount = total_outstanding
            student.fees_paid_status = 1 if total_outstanding == 0 else 0
            student.fee_delay_indicator = 1 if total_outstanding > 0 else 0
            
        db.session.commit()
        
        # Correct calculation after commit to be sure? 
        # Ideally we should re-query to be safe.
        current_outstanding = db.session.query(db.func.sum(FeesHistory.pending_amount)).filter_by(student_id=student_id).scalar() or 0
        if student:
            student.outstanding_fees_amount = current_outstanding
            student.fees_paid_status = 1 if current_outstanding == 0 else 0
            student.fee_delay_indicator = 1 if current_outstanding > 0 else 0
            db.session.commit()
            
        return jsonify({"message": "Fee updated successfully", "record": record.to_dict()})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
