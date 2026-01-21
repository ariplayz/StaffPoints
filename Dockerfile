# Use Node.js LTS as the base image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build

# Create the target directory and move the build artifacts
RUN mkdir -p /var/www/staffpoints && \
    cp -r dist/* /var/www/staffpoints/

# The server expects data.json in /var/www/staffpoints/
# We ensure the directory is writable
RUN chmod -R 777 /var/www/staffpoints

# Expose port 80
EXPOSE 80

# Start the server
CMD ["npm", "run", "server"]
