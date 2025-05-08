# YouTube MP3 Converter

A modern web application for downloading YouTube videos as MP3 audio files, available in two implementations:
1. Express.js web server (original implementation)
2. AWS Serverless architecture (new implementation)

## 🚀 AWS Serverless Implementation

This implementation uses modern AWS serverless architecture to deliver a scalable, cost-effective solution.

### AWS Architecture

This application leverages a fully serverless architecture on AWS with the following services:

- **Lambda**: Event-driven serverless functions for processing YouTube downloads and conversions
- **API Gateway**: REST API to handle frontend requests with CORS support
- **DynamoDB**: NoSQL database to track download progress and status with auto-expiring records (TTL)
- **S3**: Object storage for MP3 files with lifecycle policies (auto-delete after 1 day)
- **CloudFormation/SAM**: Infrastructure as Code (IaC) for consistent deployments
- **IAM**: Fine-grained security policies for each Lambda function
- **Lambda Layers**: Shared code and binary dependencies (FFmpeg, yt-dlp)

### Infrastructure as Code (IaC)

This project utilizes the AWS Serverless Application Model (SAM) framework, which extends CloudFormation to provide a simplified way of defining serverless resources. Key benefits include:

- **Single Template**: The entire application infrastructure is defined in `template.yaml`
- **Local Testing**: Functions can be tested locally before deployment using `sam local`
- **Simplified Deployment**: One-command deployment with `sam deploy`
- **Resource Policies**: Fine-grained IAM permissions defined declaratively
- **Cloud Development Kit (CDK) Compatible**: Can be extended with AWS CDK if needed

### AWS Project Structure

```
/
├── src/
│   └── handlers/
│       ├── videoInfo.js      # Lambda handler for fetching video info
│       ├── convertVideo.js   # Lambda handler for converting videos
│       └── progress.js       # Lambda handler for checking progress
├── layers/
│   └── ffmpeg/             # Lambda layer with ffmpeg and yt-dlp
│       └── bin/            # Binaries directory (ffmpeg, ffprobe, yt-dlp)
├── frontend/               # Frontend static files (to be hosted on S3)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── template.yaml           # SAM/CloudFormation template
├── buildspec.yml           # CodeBuild specification file
├── aws-config.js           # AWS SDK configuration
└── package.json
```

### AWS Deployment Instructions

#### 1. Setup

Clone the repository and install dependencies:

```bash
npm install
```

#### 2. Configure AWS Credentials

Ensure you have AWS credentials configured with appropriate permissions:

```bash
aws configure
```

Required IAM permissions:
- CloudFormation full access
- Lambda full access
- S3 full access
- API Gateway administrator
- DynamoDB full access
- IAM role creation permissions

#### 3. Prepare Lambda Layer

The FFmpeg layer requires Linux-compatible binaries:

```bash
# Create the layer directory structure
mkdir -p layers/ffmpeg/bin

# Download and extract FFmpeg for Amazon Linux 2
# Place ffmpeg and ffprobe in the bin directory

# Download yt-dlp for Linux and place in bin directory
# Ensure files are executable
```

#### 4. Deploy with SAM

```bash
# Build the application
sam build

# Deploy to AWS (interactive guided deployment)
sam deploy --guided

# Or use the deployment script
./deploy-sam.bat
```

### AWS Resource Management

The application creates several AWS resources:

- **S3 Bucket**: `youtube-mp3-converter-files-{AccountId}-{Stage}` - Stores converted MP3 files
- **DynamoDB Table**: `youtube-mp3-converter-progress-{Stage}` - Tracks conversion progress
- **Lambda Functions**:
  - `GetVideoInfoFunction` - Fetches video metadata
  - `ConvertVideoFunction` - Handles conversion process
  - `CheckProgressFunction` - Provides status updates
- **Lambda Layer**: `ffmpeg-yt-dlp-layer` - Contains binary dependencies
- **API Gateway**: RESTful API with CORS support

### Automated Resource Lifecycle

The application implements several automated lifecycle policies:

- **S3 Object Lifecycle**: MP3 files are automatically deleted after 1 day
- **DynamoDB TTL**: Progress records expire automatically
- **Lambda Timeouts**: Processing functions timeout after 15 minutes maximum

## 🖥️ Express.js Implementation (Original)

The original implementation uses a Node.js Express server with direct YouTube audio downloads.

### How to Run (Windows)

Make sure you run these commands from the correct directory:

```powershell
# Navigate to the project directory (use semicolon for PowerShell)
cd "E:\Virtual Box VMs\YT to MP3 app\YT-to-MP3-Converter"; 

# Start the server
node server.js
```

Then access the application at: http://localhost:3001

### 🐳 Docker Support

You can also run this application using Docker, which eliminates all dependency issues:

#### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# To stop the container
docker-compose down
```

#### Using Docker Directly

```bash
# Build the Docker image
docker build -t youtube-mp3-converter .

# Run the container
docker run -p 3001:3001 -v $(pwd)/downloads:/app/downloads youtube-mp3-converter
```

## Features

- Convert YouTube videos to MP3 format
- Modern dark theme UI
- Fetches video information (title, author, duration, thumbnail)
- Simple user experience
- Responsive design

## Requirements

### Without Docker:
- Node.js (v14+)
- Internet connection

### With Docker:
- Docker and Docker Compose
- Internet connection

## Installation (Express.js Version)

### Standard Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the application:
   ```
   node server.js
   ```

### Docker Installation
1. Clone the repository
2. Build and run using Docker Compose:
   ```
   docker-compose up -d
   ```

## Usage

1. Navigate to http://localhost:3001 in your browser (or your deployed API URL for AWS)
2. Enter a YouTube URL
3. Click "Fetch Info" to retrieve the video details
4. Click "Convert" to download the MP3 file

## Technical Details

### Frontend
- HTML5, CSS3, JavaScript
- Responsive design
- Dark theme UI

### Backend
- Node.js with Express.js or AWS Lambda
- YouTube data extraction using yt-dlp
- Direct stream downloading

## Legal Notice

This application is for personal use only. Please respect copyright laws and YouTube's terms of service. The developers are not responsible for any misuse of this tool.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for providing the core downloading functionality
- AWS SAM for serverless implementation
- Node.js and Express.js for the backend framework
