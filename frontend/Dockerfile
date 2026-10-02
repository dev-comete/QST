# Use the official lightweight Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
# We do this before copying the rest of the code to cache the node_modules layer
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the port (3000 for Create React App, 5173 for Vite)
EXPOSE 5173

# Start the development server
# Use "npm run dev" if you are using Vite instead of Create React App
CMD ["npm", "start"]