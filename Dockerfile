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
# We'll serve from /app/dist instead to avoid volume masking issues if needed,
# but keeping /var/www/staffpoints as the primary location as requested.
RUN mkdir -p /var/www/staffpoints && \
    cp -r dist/* /var/www/staffpoints/

# We ensure the directory is writable for the data.json file
RUN chmod -R 777 /var/www/staffpoints

# Use environment variables to define paths
ENV WEB_ROOT=/var/www/staffpoints
ENV DATA_FILE=/var/www/staffpoints/data.json
EXPOSE 80

# Start the server
CMD ["npm", "run", "server"]
