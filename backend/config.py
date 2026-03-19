import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-prod'
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(BASE_DIR, 'instance', 'stayontrack.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ML_MODEL_PATH = os.path.join(BASE_DIR, '..', 'ml_engine', 'saved_models')
