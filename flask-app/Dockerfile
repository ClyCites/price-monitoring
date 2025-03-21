# Use Python official image as base
FROM python:3.9-slim

# Set the working directory
WORKDIR /usr/src/app

# Install pip dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Expose the port the app will run on
EXPOSE 5001

# Run the Flask app
CMD ["python", "app.py"]
