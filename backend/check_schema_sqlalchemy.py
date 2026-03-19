from app import create_app, db
from sqlalchemy import inspect
import os

app = create_app()
with app.app_context():
    print(f"DB URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    insp = inspect(db.engine)
    if 'student' in insp.get_table_names():
        cols = [c['name'] for c in insp.get_columns('student')]
        print(f"Student columns: {cols}")
        if 'age' in cols:
            print("Age column EXISTS.")
        else:
            print("Age column MISSING.")
    else:
        print("Student table MISSING.")
