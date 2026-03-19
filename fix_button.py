import re

# Read the file
with open(r'c:\Users\darsh\OneDrive\Desktop\student-ai\frontend\app\dashboard\students\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the button tag to add type="button"
# Looking for button tags that are immediately followed by onClick
pattern = r'(<button)\s+(onClick=\{\(\) => handleDelete\(student\.id\)\})'
replacement = r'\1 type="button" \2'

new_content = re.sub(pattern, replacement, content)

# Write back
with open(r'c:\Users\darsh\OneDrive\Desktop\student-ai\frontend\app\dashboard\students\page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("File updated successfully")
