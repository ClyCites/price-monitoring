from flask import Flask, request, jsonify
from sklearn.externals import joblib
import os
from scripts.train_model import train_model_on_data

app = Flask(__name__)

# Folder to store uploaded datasets
UPLOAD_FOLDER = 'uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load model function
def load_model():
    try:
        model = joblib.load('models/price-model.pkl')
        return model
    except Exception as e:
        return str(e)

# Route to retrain the model with an uploaded dataset
@app.route('/retrain', methods=['POST'])
def retrain_model():
    if 'dataset' not in request.files:
        return jsonify({"message": "No file part"})
    
    file = request.files['dataset']
    
    if file.filename == '':
        return jsonify({"message": "No selected file"})
    
    try:
        # Save the uploaded file
        dataset_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(dataset_path)

        # Retrain the model with the uploaded dataset
        retrained_model_file = train_model_on_data(dataset_path)
        return jsonify({"message": f"Model retrained and saved as '{retrained_model_file}'"})
    
    except Exception as e:
        return jsonify({"message": f"Error retraining model: {str(e)}"})

# Route to make price prediction
@app.route('/predict', methods=['POST'])
def predict():
    model = load_model()
    if isinstance(model, str):
        return jsonify({"message": f"Error loading model: {model}"})
    
    data = request.get_json()
    features = data['features']  # Expecting features as an array [X1, X2]
    
    # Make prediction using the retrained model
    prediction = model.predict([features])
    
    return jsonify({"prediction": prediction[0]})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)
