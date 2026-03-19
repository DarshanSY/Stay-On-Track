from flask import Blueprint, jsonify
import os
import json
import joblib

explain_bp = Blueprint('explain', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ML_ENGINE_DIR = os.path.join(BASE_DIR, '../ml_engine')
MODELS_DIR = os.path.join(ML_ENGINE_DIR, 'saved_models')

@explain_bp.route('/pca', methods=['GET'])
def get_pca_visualization():
    """
    Returns PCA components and student risk bands for visualization.
    """
    try:
        results_path = os.path.join(MODELS_DIR, 'pca_results.json')
        if not os.path.exists(results_path):
            return jsonify({"error": "PCA results not found. Please retrain models."}), 404
            
        with open(results_path, 'r') as f:
            data = json.load(f)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@explain_bp.route('/shap', methods=['GET'])
def get_shap_values():
    # Placeholder for SHAP - usually precomputed or computed on demand
    return jsonify({"message": "SHAP values endpoint (placeholder)"})

@explain_bp.route('/lime', methods=['GET'])
def get_lime_values():
    # Placeholder for LIME
    return jsonify({"message": "LIME values endpoint (placeholder)"})
