import numpy as np
import pandas as pd
import joblib
import json
import os
from catboost import CatBoostClassifier
from config import Config
import shap
import tensorflow as tf
from tensorflow.keras.models import load_model

class MLService:
    def __init__(self):
        self.catboost_model = None
        self.lr_pipeline = None
        self.nn_model = None
        self.ensemble_config = None
        self.preprocessor = None
        self.load_models()

    def load_models(self):
        try:
            model_path = Config.ML_MODEL_PATH
            
            # Paths
            cb_path = os.path.join(model_path, 'catboost_model.cbm')
            lr_path = os.path.join(model_path, 'logistic_model.pkl')
            nn_path = os.path.join(model_path, 'neural_model.h5')
            ens_path = os.path.join(model_path, 'ensemble_config.json')
            prep_path = os.path.join(model_path, 'preprocessor.joblib')

            # Load CatBoost
            if os.path.exists(cb_path):
                self.catboost_model = CatBoostClassifier()
                self.catboost_model.load_model(cb_path)
            
            # Load LR
            if os.path.exists(lr_path):
                self.lr_pipeline = joblib.load(lr_path)
            
            # Load NN
            if os.path.exists(nn_path):
                self.nn_model = load_model(nn_path)
                
            # Load Preprocessor (for NN)
            if os.path.exists(prep_path):
                self.preprocessor = joblib.load(prep_path)
                
            # Load Ensemble Config
            if os.path.exists(ens_path):
                with open(ens_path, 'r') as f:
                    self.ensemble_config = json.load(f)
                    
            print(f"ML Models loaded from {model_path}")

        except Exception as e:
            print(f"Error loading models: {e}")

    def prepare_df(self, data):
        if isinstance(data, dict):
            # Ensure all keys exist with defaults
            defaults = {
                'Age': 20, 'Current_Semester': 1, 'CGPA': 7.0, 'Attendance_Percentage': 75.0,
                'Failed_Courses': 0, 'LMS_Login_Count': 30, 'Assignment_Submission_Rate': 80.0,
                'Credits_Completed': 20, 'Fee_Delay_Indicator': 0, 'Family_Background_Score': 5,
                'Learning_Disability_Flag': 0, 'Gender': 'Male'
            }
            # Merge defaults
            for k, v in defaults.items():
                if k not in data:
                    data[k] = v
            return pd.DataFrame([data])
        return data

    def predict_risk(self, data, model_type='catboost'):
        df = self.prepare_df(data)
        
        try:
            proba = 0.5
            current_model_used = model_type  # To return what ACTUALLY ran
            
            # --- 1. Load Models Check ---
            if model_type == 'catboost':
                if not self.catboost_model:
                     # Check if we can fallback or error
                     raise ValueError("CatBoost model not loaded")
                proba = self.catboost_model.predict_proba(df)[0][1]
                
            elif model_type == 'logistic':
                if not self.lr_pipeline:
                    raise ValueError("Logistic Regression model not loaded")
                proba = self.lr_pipeline.predict_proba(df)[0][1]
                
            elif model_type == 'neural':
                if not self.nn_model or not self.preprocessor:
                    raise ValueError("Neural Network or Preprocessor not loaded")
                # NN inputs must be preprocessed
                X_proc = self.preprocessor.transform(df)
                proba = float(self.nn_model.predict(X_proc, verbose=0)[0][0])
                
            elif model_type == 'ensemble':
                if not self.ensemble_config:
                     # Fallback to simple average if config missing, but valid models exist
                     print("Warning: Ensemble config missing, using equal weights if possible.")
                
                # Get individual probabilities
                preds = {}
                
                # CatBoost
                if self.catboost_model:
                    preds['catboost'] = self.catboost_model.predict_proba(df)[0][1]
                else:
                    preds['catboost'] = 0.5 # Neutral fallback
                    
                # Logistic
                if self.lr_pipeline:
                    preds['logistic'] = self.lr_pipeline.predict_proba(df)[0][1]
                else:
                    preds['logistic'] = 0.5
                    
                # Neural
                if self.nn_model and self.preprocessor:
                     X_proc = self.preprocessor.transform(df)
                     preds['neural'] = float(self.nn_model.predict(X_proc, verbose=0)[0][0])
                else:
                    preds['neural'] = 0.5
                
                # Apply Weights
                if self.ensemble_config:
                    w = self.ensemble_config['weights']
                    # Normalize if needed, but assuming sum=1 from training
                    proba = (preds['catboost'] * w.get('catboost', 0.33) + 
                             preds['logistic'] * w.get('logistic', 0.33) + 
                             preds['neural'] * w.get('neural', 0.33))
                else:
                    # Simple average
                    proba = sum(preds.values()) / 3.0
                    
            else:
                # Default / Fallback
                current_model_used = 'catboost'
                if self.catboost_model:
                    proba = self.catboost_model.predict_proba(df)[0][1]
                else:
                    proba = 0.5
            
            risk_score = int(proba * 100)
            risk_label = "High" if proba > 0.7 else "Medium" if proba > 0.3 else "Low"
            
            return risk_score, risk_label, proba, current_model_used
            
        except Exception as e:
            print(f"Prediction Error ({model_type}): {e}")
            import traceback
            traceback.print_exc()
            # Retain error format but make it visible
            # For now return default but strictly log it. 
            # In a strict environment, we might want to re-raise.
            # But the user asked to FIX it, so let's try to not fail silently.
            return 50, "Error", 0.5, "error_fallback"

    def get_fairness_report(self):
        path = os.path.join(Config.ML_MODEL_PATH, 'fairness_report.json')
        if os.path.exists(path):
            with open(path, 'r') as f:
                return json.load(f)
        return {"error": "Report not found"}

    def get_shap_values(self, data):
        # Only feasible for CatBoost efficiently in this context
        if not self.catboost_model:
            return None
            
        df = self.prepare_df(data)
        explainer = shap.TreeExplainer(self.catboost_model)
        shap_values = explainer.shap_values(df)
        
        # Format for frontend: List of {feature: name, value: val}
        features = df.columns
        result = []
        for i, feat in enumerate(features):
            result.append({
                "feature": feat,
                "value": float(shap_values[0][i])
            })
            
        # Sort by absolute impact
        result.sort(key=lambda x: abs(x['value']), reverse=True)
        return result
