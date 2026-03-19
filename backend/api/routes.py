from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash
from models.student import Student
from models.user import User
from models.intervention import Intervention
from models.lms import LMSLogs
from models.alert import Alert
from services.ml_service import MLService
from services.data_service import DataService
from extensions import db
import pandas as pd
import random
from datetime import datetime
import threading
import time

main_bp = Blueprint('main', __name__)

ml_service = MLService()
data_service = DataService()

# Global config for current model type (default)
current_model_type = "catboost"

@main_bp.route('/health', methods=['GET'])
def health_check():
    print("Health check hit!")
    return jsonify({'status': 'healthy', 'message': 'StayOnTrack API is running'}), 200

# ==========================================
# ML & Prediction Routes
# ==========================================

@main_bp.route('/config/model_type', methods=['GET', 'POST'])
def model_config():
    global current_model_type
    if request.method == 'POST':
        data = request.json
        new_type = data.get('model_type')
        if new_type in ['catboost', 'logistic', 'neural', 'ensemble']:
            current_model_type = new_type
            return jsonify({'message': f'Model switched to {new_type}', 'current_model': current_model_type}), 200
        return jsonify({'error': 'Invalid model type'}), 400
    return jsonify({'current_model': current_model_type, 'options': ['catboost', 'logistic', 'neural', 'ensemble']}), 200

@main_bp.route('/predict', methods=['POST'])
def predict_dropout():
    data = request.json
    # Allow overriding model per request or use global
    model_type = data.get('model_type', current_model_type)
    
    try:
        processed_data = data_service.preprocess_for_prediction(data)
        risk_score, risk_label, probability, used_model = ml_service.predict_risk(processed_data, model_type=model_type)
        
        # Save to explanation cache if needed, or return immediately
        
        return jsonify({
            'risk_score': risk_score,
            'risk_label': risk_label,
            'probability': probability,
            'model_used': used_model
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@main_bp.route('/explain/shap', methods=['POST'])
def explain_shap():
    data = request.json
    try:
        processed_data = data_service.preprocess_for_prediction(data)
        shap_values = ml_service.get_shap_values(processed_data)
        return jsonify({'shap_values': shap_values}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@main_bp.route('/model/fairness_report', methods=['GET'])
def get_fairness_report():
    report = ml_service.get_fairness_report()
    return jsonify(report), 200

# ==========================================
# Temporal & Analytics Routes
# ==========================================

@main_bp.route('/temporal/attendance/<student_id>', methods=['GET'])
def get_attendance_trend(student_id):
    # Mock trend data based on current student data
    student = Student.query.filter_by(student_id=student_id).first()
    if not student: return jsonify([]), 200 # Return empty list instead of 404 to avoid frontend crash if ID invalid temporarily
    
    current = student.attendance_percentage or 0 # Handle None
    # Generate 6 months of history with noise
    history = []
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    for i, m in enumerate(months):
        # Trend: slightly improving or declining based on risk
        trend = -1 if student.risk_category in ['High', 'Critical'] else 1
        val = current + (i - 5) * trend * random.uniform(0.5, 2.0)
        val = max(0, min(100, val + random.uniform(-2, 2)))
        history.append({'month': m, 'value': round(val, 1)})
    
    return jsonify(history), 200

@main_bp.route('/temporal/gpa/<student_id>', methods=['GET'])
def get_gpa_trend(student_id):
    student = Student.query.filter_by(student_id=student_id).first()
    if not student: return jsonify([]), 200
    
    current = student.cgpa or 0 # Handle None
    history = []
    # Handle missing current_semester
    curr_sem = student.current_semester if student.current_semester else 1
    semesters = [f"Sem {i}" for i in range(max(1, curr_sem - 5), curr_sem + 1)]
    for i, s in enumerate(semesters):
        val = current + random.uniform(-0.5, 0.5)
        history.append({'semester': s, 'value': round(max(0, min(10, val)), 2)})
        
    return jsonify(history), 200

@main_bp.route('/temporal/lms/<student_id>', methods=['GET'])
def get_lms_trend(student_id):
    # Return LMSLogs if exist, else mock
    logs = LMSLogs.query.filter_by(student_id=student_id).all()
    if logs:
        return jsonify([l.to_dict() for l in logs]), 200
    
    # Mock
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    history = []
    for m in months:
        history.append({
            'month': m, 
            'login_count': int(random.normalvariate(20, 5)),
            'assignments': int(random.normalvariate(4, 1))
        })
    return jsonify(history), 200

@main_bp.route('/analytics', methods=['GET'])
def get_analytics():
    # Group by semester and calculate averages
    results = db.session.query(
        Student.current_semester,
        db.func.avg(Student.cgpa),
        db.func.avg(Student.risk_score)
    ).group_by(Student.current_semester).order_by(Student.current_semester).all()
    
    analytics_data = []
    for semester, avg_cgpa, avg_risk in results:
        if semester:
            analytics_data.append({
                'semester': f"Semester {semester}",
                'cgpa': round(avg_cgpa, 2) if avg_cgpa else 0,
                'risk': round(avg_risk, 2) if avg_risk else 0
            })
            
    return jsonify(analytics_data), 200

# ==========================================
# LMS Integration
# ==========================================

@main_bp.route('/lms/sync', methods=['GET'])
def sync_lms_data():
    # Simulate fetching data from Moodle
    def run_sync():
        with db.session.begin(): # Use app context in real thread
            students = Student.query.all()
            for s in students:
                # Update student LMS stats
                s.lms_activity_score = min(100, s.lms_activity_score + random.uniform(-5, 5))
                s.lms_login_count += random.randint(1, 10)
                # Create log
                log = LMSLogs(student_id=s.student_id, month=datetime.now().strftime("%Y-%m"),
                              login_count=s.lms_login_count, assignments_submitted=random.randint(0, 5))
                db.session.add(log)
            db.session.commit()
            
    # For demo, just run inline or it fails without context in thread
    # In prod, use Celery
    try:
        students = Student.query.all()
        count = 0
        for s in students:
            # Simulate update
            s.lms_login_count = min(1000, s.lms_login_count + random.randint(5, 20))
            db.session.add(LMSLogs(student_id=s.student_id, month=datetime.now().strftime("%Y-%m"),
                          login_count=random.randint(10, 50), assignments_submitted=random.randint(1, 5)))
            count += 1
        db.session.commit()
        
        # Trigger Alert
        alert = Alert(message=f"LMS Sync Completed. Updated {count} records.", type="System", is_read=False)
        db.session.add(alert)
        db.session.commit()
        
        return jsonify({'message': f'Synced {count} records from LMS'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==========================================
# Intervention & Alerts
# ==========================================

@main_bp.route('/intervention/generate', methods=['GET'])
def generate_interventions():
    # Recommendation Engine
    student_id = request.args.get('student_id')
    student = Student.query.filter_by(student_id=student_id).first()
    if not student: return jsonify({'error': 'Student not found'}), 404
    
    recommendations = []
    
    if student.attendance_percentage < 75:
        recommendations.append("Mandatory Attendance Counseling")
        recommendations.append("SMS Alert to Parents")
        
    if student.cgpa < 5.0:
        recommendations.append("Remedial Classes for Failed Subjects")
        recommendations.append("Peer Tutoring Assignment")
        
    if student.fee_delay_indicator == 1:
        recommendations.append("Financial Aid Consultation")
        
    if student.risk_category == 'Critical':
        recommendations.append("Immediate Meeting with Dean")
        
    if not recommendations:
        recommendations.append("Keep up the good work! Monitor LMS usage.")
        
    return jsonify({'recommendations': recommendations}), 200

@main_bp.route('/alerts', methods=['GET'])
def get_alerts():
    alerts = Alert.query.order_by(Alert.timestamp.desc()).limit(10).all()
    return jsonify([a.to_dict() for a in alerts]), 200

@main_bp.route('/student/login', methods=['POST'])
def student_login():
    data = request.json
    student_id = data.get('student_id')
    password = data.get('password')
    
    if not student_id or not password:
        return jsonify({'error': 'Student ID and password are required'}), 400
        
    student = Student.query.filter_by(student_id=student_id).first()
    
    if student and student.check_password(password):
        # Successful login
        # In a real app, use JWT or Session. For now, returning ID for client-side storage.
        return jsonify({
            'message': 'Login successful',
            'student': student.to_dict()
        }), 200
        
    return jsonify({'error': 'Invalid credentials'}), 401

@main_bp.route('/student/dashboard/<student_id>', methods=['GET'])
def get_student_dashboard(student_id):
    # Verify student exists
    student = Student.query.filter_by(student_id=student_id).first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404
        
    # Get recent alerts for this student (if we had student-specific alerts, we'd filter by student_id)
    # Since existing alerts model doesn't explicitly link to student_id for all alerts, 
    # we'll fetch system alerts or alerts containing student ID in text.
    # For now, let's fetch global alerts + any that mention the student.
    
    all_alerts = Alert.query.order_by(Alert.timestamp.desc()).limit(20).all()
    student_alerts = [
        a.to_dict() for a in all_alerts 
        if student_id in a.message or a.type == 'System' or 'General' in a.type
    ]
    
    # Get interventions
    interventions = Intervention.query.filter_by(student_id=student_id).all()
    
    dashboard_data = {
        'student': student.to_dict(),
        'alerts': student_alerts,
        'interventions': [i.to_dict() for i in interventions]
    }
    
    return jsonify(dashboard_data), 200

# ==========================================
# Existing Routes (Students, etc.)
# ==========================================

@main_bp.route('/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students]), 200

@main_bp.route('/students/<id_or_sid>', methods=['GET'])
def get_student_detail(id_or_sid):
    # Try integer lookup first (PK)
    try:
        s_id = int(id_or_sid)
        student = Student.query.get(s_id)
        if student:
            return jsonify(student.to_dict()), 200
    except ValueError:
        pass
    
    # Try finding by student_id
    student = Student.query.filter_by(student_id=id_or_sid).first()
    if student:
        return jsonify(student.to_dict()), 200

    # Fallback: If it looks like a number or partial ID, try adding "STU" prefix
    # e.g. "006" -> "STU006", "6" -> "STU006" (if formatted that way)
    # Just simple "STU" + value
    try:
        # Check if it's alphanumeric but missing prefix, or just digits
        # This covers "006" -> "STU006"
        potential_id = f"STU{id_or_sid}"
        student = Student.query.filter_by(student_id=potential_id).first()
        if student:
            return jsonify(student.to_dict()), 200
    except:
        pass
        
    return jsonify({'error': 'Student not found'}), 404

@main_bp.route('/students/<int:id>', methods=['PUT'])
def update_student(id):
    student = Student.query.get_or_404(id)
    data = request.json
    
    try:
        # Update fields if present in request
        if 'environment_score' in data:
            student.environment_score = float(data['environment_score'])
        if 'family_environment_notes' in data:
            student.family_environment_notes = data['family_environment_notes']
        if 'backlog_count' in data:
            student.backlog_count = int(data['backlog_count'])
        
        # General updates
        if 'risk_category' in data:
            student.risk_category = data['risk_category']
            
        db.session.commit()
        return jsonify(student.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@main_bp.route('/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    student = Student.query.get(id)
    if not student: return jsonify({'error': 'Student not found'}), 404
    try:
        db.session.delete(student)
        db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    except:
        db.session.rollback()
        return jsonify({'error': 'Failed'}), 500

@main_bp.route('/students/upload', methods=['POST'])
def upload_students():
    """Upload and process student CSV file with improved error handling"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided. Please select a CSV file to upload.'}), 400
    
    file = request.files['file']
    
    # Check if file is selected
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected. Please choose a CSV file.'}), 400
    
    # Validate file extension
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'Invalid file type. Please upload a CSV file.'}), 400
    
    try:
        # Read CSV file
        df = pd.read_csv(file)
        
        # Check if CSV is empty
        if df.empty:
            return jsonify({'error': 'CSV file is empty. Please provide a file with student data.'}), 400
        
        # Log column names for debugging
        logger.info(f"CSV columns: {df.columns.tolist()}")
        
        # Flexible column name mapping (case-insensitive)
        column_mapping = {}
        for col in df.columns:
            col_lower = col.lower().strip()
            if 'student' in col_lower and 'id' in col_lower:
                column_mapping['student_id'] = col
            elif col_lower in ['name', 'student name', 'full name']:
                column_mapping['name'] = col
            elif col_lower in ['risk score', 'risk_score', 'riskscore']:
                column_mapping['risk_score'] = col
            elif col_lower in ['risk category', 'risk_category', 'riskcategory', 'risk band']:
                column_mapping['risk_category'] = col
            elif col_lower in ['semester', 'current semester', 'current_semester']:
                column_mapping['current_semester'] = col
            elif col_lower in ['cgpa', 'gpa']:
                column_mapping['cgpa'] = col
            elif col_lower in ['attendance', 'attendance percentage', 'attendance_percentage']:
                column_mapping['attendance'] = col
            elif col_lower in ['age']:
                column_mapping['age'] = col
            elif col_lower in ['gender', 'sex']:
                column_mapping['gender'] = col
        
        # Debug logging
        logger.info(f"Column mapping created: {column_mapping}")
        
        # Check for required columns
        if 'student_id' not in column_mapping:
            return jsonify({'error': 'Missing required column: "Student ID". CSV must contain student ID column.'}), 400
        
        count = 0
        errors = []
        
        for idx, row in df.iterrows():
            try:
                # Extract student ID
                sid = str(row.get(column_mapping['student_id'], '')).strip()
                if not sid or sid.lower() == 'nan':
                    errors.append(f"Row {idx + 2}: Missing student ID")
                    continue
                
                # Check if student exists
                student = Student.query.filter_by(student_id=sid).first()
                
                if not student:
                    # Create new student with available data
                    student = Student(
                        student_id=sid,
                        name=str(row.get(column_mapping.get('name'), 'Unknown')).strip() if 'name' in column_mapping else 'Unknown',
                        age=int(float(row.get(column_mapping.get('age'), 20))) if 'age' in column_mapping and pd.notna(row.get(column_mapping.get('age'))) else 20,
                        gender=str(row.get(column_mapping.get('gender'), 'M')).strip()[0].upper() if 'gender' in column_mapping else 'M',
                        current_semester=int(float(row.get(column_mapping.get('current_semester'), 1))) if 'current_semester' in column_mapping and pd.notna(row.get(column_mapping.get('current_semester'))) else 1,
                        cgpa=float(row.get(column_mapping.get('cgpa'), 0)) if 'cgpa' in column_mapping and pd.notna(row.get(column_mapping.get('cgpa'))) else 0.0,
                        attendance_percentage=float(row.get(column_mapping.get('attendance'), 0)) if 'attendance' in column_mapping and pd.notna(row.get(column_mapping.get('attendance'))) else 0.0,
                        risk_score=float(row.get(column_mapping.get('risk_score'), 0)) if 'risk_score' in column_mapping and pd.notna(row.get(column_mapping.get('risk_score'))) else 0.0,
                        risk_category=str(row.get(column_mapping.get('risk_category'), 'Low')).strip() if 'risk_category' in column_mapping else 'Low',
                        credits_completed=0,
                        fee_delay_indicator=0,
                        family_background_score=5,
                        learning_disability_flag=0,
                        lms_login_count=0,
                        assignment_submission_rate=0.0,
                        password_hash=generate_password_hash('password123')
                    )
                    db.session.add(student)
                else:
                    # Update existing student with new data
                    if 'name' in column_mapping and pd.notna(row.get(column_mapping['name'])):
                        student.name = str(row.get(column_mapping['name'])).strip()
                    if 'cgpa' in column_mapping and pd.notna(row.get(column_mapping['cgpa'])):
                        student.cgpa = float(row.get(column_mapping['cgpa']))
                    if 'attendance' in column_mapping and pd.notna(row.get(column_mapping['attendance'])):
                        student.attendance_percentage = float(row.get(column_mapping['attendance']))
                    if 'risk_score' in column_mapping and pd.notna(row.get(column_mapping['risk_score'])):
                        student.risk_score = float(row.get(column_mapping['risk_score']))
                    if 'risk_category' in column_mapping and pd.notna(row.get(column_mapping['risk_category'])):
                        student.risk_category = str(row.get(column_mapping['risk_category'])).strip()
                    
                    # Ensure password is set if missing (for re-uploads of broken records)
                    if not student.password_hash:
                         student.set_password('password123')
                
                count += 1
                
            except Exception as e:
                errors.append(f"Row {idx + 2}: {str(e)}")
                logger.error(f"Error processing row {idx + 2}: {e}")
                continue
        
        # Commit changes
        db.session.commit()
        
        # DEBUG: Check first student for risk values
        first_uploaded = Student.query.filter_by(student_id=df.iloc[0].get(column_mapping['student_id'])).first()
        debug_info = {}
        if first_uploaded:
            debug_info = {
                'sample_student':first_uploaded.student_id,
                'risk_score': first_uploaded.risk_score,
                'risk_category': first_uploaded.risk_category
            }
        
        # Prepare response
        response_data = {
            'message': f'Successfully processed {count} student(s)',
            'processed': count,
            'total_rows': len(df),
            'debug': debug_info  # Add debug info
        }
        
        if errors:
            response_data['warnings'] = errors[:10]  # Limit to first 10 errors
            response_data['total_errors'] = len(errors)
        
        logger.info(f"Upload completed: {count} students processed, {len(errors)} errors")
        
        return jsonify(response_data), 200
        
    except pd.errors.EmptyDataError:
        return jsonify({'error': 'CSV file is empty or corrupted.'}), 400
    except pd.errors.ParserError as e:
        return jsonify({'error': f'CSV parsing error: {str(e)}. Please check file format.'}), 400
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        db.session.rollback()
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

# Interventions CRUD
@main_bp.route('/interventions', methods=['GET'])
def get_interventions():
    interventions = Intervention.query.all()
    grouped = {
        'planned': [i.to_dict() for i in interventions if i.status == 'Planned'],
        'inProgress': [i.to_dict() for i in interventions if i.status == 'In Progress'],
        'resolved': [i.to_dict() for i in interventions if i.status == 'Resolved']
    }
    return jsonify(grouped), 200

@main_bp.route('/interventions', methods=['POST'])
def create_intervention():
    data = request.json
    try:
        new_int = Intervention(
            student_id=data.get('student_id'),
            title=data.get('title'),
            type=data.get('type'),
            description=data.get('description'),
            status=data.get('status', 'Planned'),
            assigned_to=data.get('assigned_to')
        )
        db.session.add(new_int)
        db.session.commit()
        return jsonify(new_int.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@main_bp.route('/interventions/<int:id>', methods=['DELETE'])
def delete_intervention(id):
    i = Intervention.query.get(id)
    if not i: return jsonify({'error': 'Not found'}), 404
    db.session.delete(i)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200

@main_bp.route('/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    # Return aggregated stats
    total_students = Student.query.count()
    risk_counts = db.session.query(Student.risk_category, db.func.count(Student.risk_category)).group_by(Student.risk_category).all()
    risk_dist = {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0}
    for cat, count in risk_counts:
        if cat in risk_dist: risk_dist[cat] = count
            
    avg_att = db.session.query(db.func.avg(Student.attendance_percentage)).scalar() or 0
    avg_cgpa = db.session.query(db.func.avg(Student.cgpa)).scalar() or 0
    
    # New Stats
    alerts_count = Alert.query.filter_by(is_read=False).count()

    return jsonify({
        'total_students': total_students,
        'risk_distribution': risk_dist,
        'avg_attendance': round(avg_att, 2),
        'avg_cgpa': round(avg_cgpa, 2),
        'active_alerts': alerts_count
    }), 200

@main_bp.route('/user/profile', methods=['GET', 'PUT'])
def user_profile():
    user = User.query.first()
    if not user:
        user = User(name="Admin", email="admin@test.com", role="admin")
        db.session.add(user)
        db.session.commit()
        
    if request.method == 'PUT':
        data = request.json
        user.name = data.get('name', user.name)
        user.email = data.get('email', user.email)
        db.session.commit()
        
    return jsonify(user.to_dict()), 200
