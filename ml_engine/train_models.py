import pandas as pd
import numpy as np
import json
import os
import joblib
import pickle
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from catboost import CatBoostClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.decomposition import PCA
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout

# Setup Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'saved_models')
os.makedirs(MODELS_DIR, exist_ok=True)

def train_models():
    print("Loading data...")
    try:
        df = pd.read_csv('student_dropout_data.csv')
    except FileNotFoundError:
        print("Data file not found. Run dataset_generator.py first.")
        return

    # Define Features
    categorical_features = ['Gender', 'Fee_Delay_Indicator', 'Learning_Disability_Flag']
    numeric_features = ['Age', 'Current_Semester', 'CGPA', 'Attendance_Percentage', 
                        'Failed_Courses', 'LMS_Login_Count', 'Assignment_Submission_Rate', 
                        'Credits_Completed', 'Family_Background_Score']

    X = df.drop(['Dropout_Status', 'Student_ID'], axis=1)
    y = df['Dropout_Status']

    # Split Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Preprocessing
    # Note: CatBoost handles categoricals, others need encoding
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])

    # Save Preprocessor for Inference (for LR/NN)
    # We fit it on X_train first
    preprocessor.fit(X_train)
    joblib.dump(preprocessor, os.path.join(MODELS_DIR, "preprocessor.joblib"))

    # ==========================================
    # 1. CatBoost Training
    # ==========================================
    print("\nTraining CatBoost...")
    # CatBoost handles Imbalance with auto_class_weights='Balanced' if needed, or we use SMOTE data
    # For consistency, let's use the raw data for CatBoost but maybe with class weights
    cb_model = CatBoostClassifier(iterations=200, depth=6, learning_rate=0.1, 
                                  verbose=0, cat_features=categorical_features,
                                  auto_class_weights='Balanced')
    cb_model.fit(X_train, y_train)
    y_pred_cb = cb_model.predict(X_test)
    acc_cb = accuracy_score(y_test, y_pred_cb)
    print(f"CatBoost Accuracy: {acc_cb:.4f}")
    cb_model.save_model(os.path.join(MODELS_DIR, "catboost_model.cbm"))

    # ==========================================
    # 2. Logistic Regression (with SMOTE)
    # ==========================================
    print("\nTraining Logistic Regression...")
    lr_pipeline = ImbPipeline(steps=[
        ('preprocessor', preprocessor),
        ('smote', SMOTE(random_state=42)),
        ('classifier', LogisticRegression(max_iter=1000, class_weight='balanced'))
    ])
    lr_pipeline.fit(X_train, y_train)
    y_pred_lr = lr_pipeline.predict(X_test)
    acc_lr = accuracy_score(y_test, y_pred_lr)
    print(f"Logistic Regression Accuracy: {acc_lr:.4f}")
    joblib.dump(lr_pipeline, os.path.join(MODELS_DIR, "logistic_model.pkl"))

    # ==========================================
    # 3. Neural Network (Keras)
    # ==========================================
    print("\nTraining Neural Network...")
    # Process data
    X_train_proc = preprocessor.transform(X_train)
    X_test_proc = preprocessor.transform(X_test)
    
    # SMOTE for NN
    sm = SMOTE(random_state=42)
    X_train_res, y_train_res = sm.fit_resample(X_train_proc, y_train)

    nn_model = Sequential([
        Dense(64, activation='relu', input_shape=(X_train_proc.shape[1],)),
        Dropout(0.3),
        Dense(32, activation='relu'),
        Dropout(0.2),
        Dense(1, activation='sigmoid')
    ])
    
    nn_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    nn_model.fit(X_train_res, y_train_res, epochs=20, batch_size=32, verbose=0, validation_split=0.1)
    
    y_pred_nn_prob = nn_model.predict(X_test_proc)
    y_pred_nn = (y_pred_nn_prob > 0.5).astype(int).flatten()
    acc_nn = accuracy_score(y_test, y_pred_nn)
    print(f"Neural Network Accuracy: {acc_nn:.4f}")
    nn_model.save(os.path.join(MODELS_DIR, "neural_model.h5"))

    # ==========================================
    # 4. Ensemble Config & Logic
    # ==========================================
    print("\nCreating Ensemble Config...")
    # Weighted average based on accuracy
    total_acc = acc_cb + acc_lr + acc_nn
    w_cb = acc_cb / total_acc
    w_lr = acc_lr / total_acc
    w_nn = acc_nn / total_acc
    
    ensemble_config = {
        "weights": {
            "catboost": round(w_cb, 3),
            "logistic": round(w_lr, 3),
            "neural": round(w_nn, 3)
        },
        "accuracies": {
            "catboost": round(acc_cb, 4),
            "logistic": round(acc_lr, 4),
            "neural": round(acc_nn, 4)
        }
    }
    
    with open(os.path.join(MODELS_DIR, "ensemble_config.json"), "w") as f:
        json.dump(ensemble_config, f, indent=4)
        
    print("Ensemble config saved.")

    # ==========================================
    # 5. Fairness Report
    # ==========================================
    print("\nGenerating Fairness Report...")
    # Check simple Demographic Parity on Gender
    # Compare Positive Rate (predicted dropout) for Male vs Female
    
    # Using CatBoost predictions as primary for report
    test_df = X_test.copy()
    test_df['Predicted_Status'] = y_pred_cb
    
    # Group by Gender
    fairness_stats = test_df.groupby('Gender')['Predicted_Status'].mean().to_dict()
    
    # Check Family Background fairness (example)
    # Bin score into Low (<4), Mid (4-7), High (>7)
    test_df['Background_Level'] = pd.cut(test_df['Family_Background_Score'], bins=[0, 3, 7, 10], labels=['Low', 'Mid', 'High'])
    background_fairness = test_df.groupby('Background_Level')['Predicted_Status'].mean().to_dict()
    
    fairness_report = {
        "gender_parity": fairness_stats,
        "background_parity": background_fairness,
        "notes": "Values indicate the proportion of students predicted as 'Dropout Risk'. Large discrepancies may indicate bias."
    }
    
    with open(os.path.join(MODELS_DIR, "fairness_report.json"), "w") as f:
        json.dump(fairness_report, f, indent=4)
        
    print("Fairness report saved.")

    # ==========================================
    # 6. PCA Visualization
    # ==========================================
    print("\nTraining PCA for Visualization...")
    # Use the full numerical dataset (scaled)
    # Fit PCA on the entire dataset (X) transformed
    X_processed = preprocessor.transform(X)
    
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_processed.toarray() if hasattr(X_processed, 'toarray') else X_processed)
    
    joblib.dump(pca, os.path.join(MODELS_DIR, "pca_model.pkl"))
    
    # Generate Embeddings for API
    # Combine with Student IDs and Risk Bands (using CatBoost prediction)
    # We need to predict risk for everyone to get the band
    all_preds_prob = cb_model.predict_proba(X)[:, 1]
    
    pca_results = {
        "components": [],
        "students": []
    }
    
    student_ids = df['Student_ID'].values
    names = [f"Student {sid}" for sid in student_ids] # Placeholder if names not in CSV, or use Student table if available. CSV usually doesn't have names.
    
    for i, sid in enumerate(student_ids):
        x_coord = float(X_pca[i, 0])
        y_coord = float(X_pca[i, 1])
        prob = float(all_preds_prob[i])
        
        if prob < 0.3:
            band = "Low"
        elif prob < 0.7:
            band = "Medium"
        else:
            band = "High"
            
        pca_results["components"].append([x_coord, y_coord])
        pca_results["students"].append({
            "id": str(sid),
            "name": str(sid), # Using ID as name for now as CSV might not have names
            "risk_band": band,
            "risk_probability": round(prob, 2),
            "x": x_coord,
            "y": y_coord
        })
        
    with open(os.path.join(MODELS_DIR, "pca_results.json"), "w") as f:
        json.dump(pca_results, f, indent=4)
        
    print("PCA model and results saved.")

    print("All models trained and saved successfully.")

if __name__ == "__main__":
    train_models()
