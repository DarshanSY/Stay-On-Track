import pandas as pd

# Simulate the backend logic
csv_file = "sample_student_upload.csv"
df = pd.read_csv(csv_file)

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

print("Column Mapping:")
for key, value in column_mapping.items():
    print(f"  {key}: '{value}'")

print("\n" + "="*60)
print("Testing row extraction for STU9001:")
print("="*60)

row = df.iloc[0]

# Test risk score extraction (lines 394-395 from routes.py)
risk_score_val = None
if 'risk_score' in column_mapping and pd.notna(row.get(column_mapping.get('risk_score'))):
    risk_score_val = float(row.get(column_mapping.get('risk_score'), 0))
else:
    risk_score_val = 0.0
    
print(f"\nrisk_score extraction:")
print(f"  'risk_score' in column_mapping: {'risk_score' in column_mapping}")
if 'risk_score' in column_mapping:
    print(f"  column_mapping.get('risk_score'): {column_mapping.get('risk_score')}")
    print(f"  row.get(column_mapping.get('risk_score')): {row.get(column_mapping.get('risk_score'))}")
    print(f"  pd.notna(...): {pd.notna(row.get(column_mapping.get('risk_score')))}")
print(f"  Final value: {risk_score_val}")

# Test risk category extraction
risk_category_val = None
if 'risk_category' in column_mapping:
    risk_category_val = str(row.get(column_mapping.get('risk_category'), 'Low')).strip()
else:
    risk_category_val = 'Low'
    
print(f"\nrisk_category extraction:")
print(f"  'risk_category' in column_mapping: {'risk_category' in column_mapping}")
if 'risk_category' in column_mapping:
    print(f"  column_mapping.get('risk_category'): {column_mapping.get('risk_category')}")
    print(f"  row.get(column_mapping.get('risk_category')): {row.get(column_mapping.get('risk_category'))}")
print(f"  Final value: {risk_category_val}")
