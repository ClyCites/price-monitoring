import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.externals import joblib
import os
from datetime import datetime

def train_model_on_data(dataset_path):
    """
    Retrain the existing price prediction model on a new dataset.

    Args:
    dataset_path (str): The path to the CSV dataset used for training.

    Returns:
    str: The file path of the saved model.
    """
    try:
        # Load the dataset
        data = pd.read_csv(dataset_path)
        
        # Ensure 'Date' column exists and convert it to a numeric format (e.g., Unix timestamp)
        if 'Date' not in data.columns:
            raise ValueError("'Date' column is missing from the dataset")
        
        data['Date'] = pd.to_datetime(data['Date'])
        data['Date'] = data['Date'].apply(lambda x: x.timestamp())  # Convert to Unix timestamp

        # Identify the target column (we assume the last column is the target price column)
        target = data.columns[-1]  # Assumes last column is the target

        # Automatically extract all columns except 'Date' and the target as features
        features = [col for col in data.columns if col != 'Date' and col != target]

        # Select features and target variable
        X = data[features].values
        y = data[target].values

        # Split data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Feature scaling (Standardization)
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Load existing model (if any)
        model = joblib.load('models/price-model.pkl')

        # Train the model using the dataset
        model.fit(X_train_scaled, y_train)

        # Save the retrained model
        model_file = 'models/price-model.pkl'
        joblib.dump(model, model_file)

        return model_file

    except Exception as e:
        return f"Error retraining model: {str(e)}"


# Example usage of retraining the model
dataset_path = 'models/data.csv'  # Path to your new dataset (CSV file)
retrained_model_file = train_model_on_data(dataset_path)
print(f"Model retrained and saved as {retrained_model_file}")
