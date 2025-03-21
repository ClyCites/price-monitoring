# /flask-server/app/modelController.py

from flask import jsonify
from scripts.train_model import train_new_model

def train_model():
    """
    Flask route handler for the /train endpoint to trigger model training.
    """
    try:
        # Start the model training process
        model_filename = train_new_model()
        return jsonify({"message": f"Model training completed. Model saved as {model_filename}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
