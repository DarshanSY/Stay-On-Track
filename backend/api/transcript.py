from flask import Blueprint, jsonify, request
from extensions import db
from models.transcript import Transcript
from models.student import Student
import os
import pandas as pd
import json
from werkzeug.utils import secure_filename
from datetime import datetime

transcript_bp = Blueprint('transcript', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'transcripts')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@transcript_bp.route('/upload', methods=['POST'])
def upload_transcript():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        student_id = request.form.get('student_id')
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        if not student_id:
            return jsonify({"error": "Student ID is required"}), 400
            
        student = Student.query.filter_by(student_id=student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404

        filename = secure_filename(f"{student_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Parsing Logic
        gpa_data = {}
        credit_data = {}
        backlogs = 0
        
        if filename.endswith('.csv'):
            try:
                df = pd.read_csv(filepath)
                # Expected columns: Semester, GPA, Credits, Backlogs (optional)
                # Flexible column matching
                cols = [c.lower() for c in df.columns]
                
                # Check headers
                sem_col = next((c for c in df.columns if 'sem' in c.lower()), None)
                gpa_col = next((c for c in df.columns if 'gpa' in c.lower() or 'sgpa' in c.lower()), None)
                credit_col = next((c for c in df.columns if 'credit' in c.lower()), None)
                backlog_col = next((c for c in df.columns if 'backlog' in c.lower() or 'fail' in c.lower()), None)
                
                if sem_col and gpa_col:
                    for _, row in df.iterrows():
                        sem = str(row[sem_col])
                        gpa = float(row[gpa_col])
                        gpa_data[sem] = gpa
                        
                        if credit_col:
                            credit_data[sem] = int(row[credit_col])
                            
                        if backlog_col:
                            backlogs += int(row[backlog_col])
                            
            except Exception as e:
                return jsonify({"error": f"CSV parsing error: {str(e)}"}), 400
                
        elif filename.endswith('.pdf'):
            # Placeholder for PDF parsing
            # In a real scenario, use PyPDF2 or PDFMiner
            pass
            
        # Update Student Record
        student.transcript_path = filepath
        if backlogs > 0:
            student.backlog_count = backlogs
        
        # Save Transcript Record
        transcript = Transcript(
            student_id=student_id,
            file_path=filepath,
            gpa_sem_wise=gpa_data,
            credit_sem_wise=credit_data
        )
        
        db.session.add(transcript)
        db.session.commit()
        
        return jsonify({
            "message": "Transcript uploaded and processed successfully",
            "extracted_data": {
                "gpa": gpa_data,
                "credits": credit_data,
                "backlogs": backlogs
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@transcript_bp.route('/<student_id>', methods=['GET'])
def get_transcripts(student_id):
    try:
        transcripts = Transcript.query.filter_by(student_id=student_id).order_by(Transcript.created_at.desc()).all()
        return jsonify([t.to_dict() for t in transcripts])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
