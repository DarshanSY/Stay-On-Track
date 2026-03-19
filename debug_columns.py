import pandas as pd

# Test the column matching logic
csv_file = "sample_student_upload.csv"
df = pd.read_csv(csv_file)

print("CSV Columns:")
for i, col in enumerate(df.columns):
    col_lower = col.lower().strip()
    print(f"{i+1}. '{col}' -> lower: '{col_lower}'")
    
    # Test the pattern matching
    if col_lower in ['risk score', 'risk_score', 'riskscore']:
        print("   ✓ MATCHES risk_score")
    if col_lower in ['risk category', 'risk_category', 'riskcategory', 'risk band']:
        print("   ✓ MATCHES risk_category")

print("\nSample row:")
print(df.iloc[0])
