FROM node:18-slim

# Install required packages for downloading and extracting files
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Create required directories
RUN mkdir -p downloads

# Download yt-dlp
RUN wget -O yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp && \
    chmod a+rx yt-dlp

# Set environment variable for port
ENV PORT=3001

# Expose the port
EXPOSE 3001

# Command to run the application
CMD ["node", "server.js"] 