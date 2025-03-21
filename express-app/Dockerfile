# Step 1: Use official Node.js image from Docker Hub
FROM node:18

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy the package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Make sure .env file is copied into the container (for local dev environments)
# It’s optional and depends on your setup, Docker Compose can pass these variables too
COPY .env .env

# Step 7: Expose the application port (by default it is 5000 for Express app)
EXPOSE 5000

# Step 8: Define the command to run the app
CMD ["npm", "start"]
