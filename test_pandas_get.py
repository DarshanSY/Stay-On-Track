import pandas as pd

csv_file = "sample_student_upload.csv"
df = pd.read_csv(csv_file)
row = df.iloc[0]

# Test the double .get() pattern
column_mapping = {'risk_score': 'Risk Score', 'risk_category': 'Risk Category'}

print("Testing row.get() with pandas Series:")
print(f"Type of row: {type(row)}")
print(f"\nDirect access row['Risk Score']: {row['Risk Score']}")
print(f"Using .get() row.get('Risk Score'): {row.get('Risk Score')}")
print(f"Using double .get() row.get(column_mapping.get('risk_score')): {row.get(column_mapping.get('risk_score'))}")

# Test what the actual constructor call would do
risk_score_val = float(row.get(column_mapping.get('risk_score'), 0)) if 'risk_score' in column_mapping and pd.notna(row.get(column_mapping.get('risk_score'))) else 0.0
print(f"\nFinal risk_score value: {risk_score_val}")

# Check if maybe there's a hidden issue with spaces or types
risk_col_name = column_mapping.get('risk_score')
print(f"\nColumn name: '{risk_col_name}'")
print(f"Column name in df.columns: {risk_col_name in df.columns}")
print(f"All columns: {list(df.columns)}")
