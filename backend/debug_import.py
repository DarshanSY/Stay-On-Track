
import sys
import os
sys.path.insert(0, os.getcwd())

try:
    import api
    print(f"api package: {api}")
    print(f"api file: {getattr(api, '__file__', 'no file')}")
    
    import api.routes
    print(f"api.routes file: {api.routes.__file__}")
    
    from api.routes import main_bp
    print(f"main_bp: {main_bp}")
    
except Exception as e:
    print(f"Error: {e}")
