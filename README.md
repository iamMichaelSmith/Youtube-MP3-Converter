# YouTube MP3 Converter - Serverless AWS Edition

A YouTube to MP3 converter application built using serverless architecture on AWS. This application allows users to convert YouTube videos to high-quality MP3 audio files quickly and easily, utilizing AWS's modern serverless service stack.

## Architecture

This application leverages a fully serverless architecture on AWS with the following services:

- **Lambda**: Event-driven serverless functions for processing YouTube downloads and conversions
- **API Gateway**: REST API to handle frontend requests with CORS support
- **DynamoDB**: NoSQL database to track download progress and status with auto-expiring records (TTL)
- **S3**: Object storage for MP3 files with lifecycle policies (auto-delete after 1 day)
- **CloudFormation/SAM**: Infrastructure as Code (IaC) for consistent deployments
- **IAM**: Fine-grained security policies for each Lambda function
- **Lambda Layers**: Shared code and binary dependencies (FFmpeg, yt-dlp)

## Infrastructure as Code (IaC)

This project utilizes the AWS Serverless Application Model (SAM) framework, which extends CloudFormation to provide a simplified way of defining serverless resources. Key benefits include:

- **Single Template**: The entire application infrastructure is defined in `template.yaml`
- **Local Testing**: Functions can be tested locally before deployment using `sam local`
- **Simplified Deployment**: One-command deployment with `sam deploy`
- **Resource Policies**: Fine-grained IAM permissions defined declaratively
- **Cloud Development Kit (CDK) Compatible**: Can be extended with AWS CDK if needed

## Project Structure

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
├── package.json
└── README.md
```

## Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js 16+
- AWS SAM CLI
- FFmpeg and yt-dlp binaries for Lambda layer (Linux compatible)

## Deployment Instructions

### 1. Setup

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Configure AWS Credentials

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

### 3. Prepare Lambda Layer

The FFmpeg layer requires Linux-compatible binaries:

```bash
# Create the layer directory structure
mkdir -p layers/ffmpeg/bin

# Download and extract FFmpeg for Amazon Linux 2
# Place ffmpeg and ffprobe in the bin directory

# Download yt-dlp for Linux and place in bin directory
# Ensure files are executable
```

### 4. Deploy with SAM

```bash
# Build the application
sam build

# Deploy to AWS (interactive guided deployment)
sam deploy --guided

# Or use the deployment script
./deploy-sam.bat
```

During deployment, SAM will:
1. Create an S3 deployment bucket
2. Package Lambda functions
3. Deploy Lambda layer with FFmpeg
4. Create API Gateway, DynamoDB table, and S3 bucket
5. Set up IAM roles and policies
6. Output the API endpoint URL

### 5. Deploy the Frontend

After the backend deployment is complete, update the API endpoint in the frontend:

```javascript
const API_BASE_URL = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev';
```

Then deploy the frontend to an S3 bucket configured for static website hosting:

```bash
aws s3 sync frontend/ s3://your-frontend-bucket/ --acl public-read
```

## Resource Management

The application creates several AWS resources:

- **S3 Bucket**: `youtube-mp3-converter-files-{AccountId}-{Stage}` - Stores converted MP3 files
- **DynamoDB Table**: `youtube-mp3-converter-progress-{Stage}` - Tracks conversion progress
- **Lambda Functions**:
  - `GetVideoInfoFunction` - Fetches video metadata
  - `ConvertVideoFunction` - Handles conversion process
  - `CheckProgressFunction` - Provides status updates
- **Lambda Layer**: `ffmpeg-yt-dlp-layer` - Contains binary dependencies
- **API Gateway**: RESTful API with CORS support

## Automated Resource Lifecycle

The application implements several automated lifecycle policies:

- **S3 Object Lifecycle**: MP3 files are automatically deleted after 1 day
- **DynamoDB TTL**: Progress records expire automatically
- **Lambda Timeouts**: Processing functions timeout after 15 minutes maximum

## Security Considerations

- IAM roles follow the principle of least privilege
- S3 bucket blocks public access
- API endpoints can be secured with API keys or Cognito (configurable)
- Data is not persisted beyond necessary timeframes

## CI/CD Integration

For continuous integration and deployment, this repository is configured with AWS CodeBuild using the included `buildspec.yml` file. When set up with CodePipeline, changes pushed to the repository will automatically trigger a new deployment.

## Usage

1. Open the application URL in your browser
2. Paste a YouTube URL in the input field
3. Click "Fetch Info" to verify the video
4. Click "Convert & Download" to convert the video to MP3
5. The MP3 file will download automatically when ready

## License

This project is licensed under the ISC License.

## Disclaimer

This tool is for personal use only. Please respect copyright laws and terms of service for YouTube.

## Professional Implementation Notes

This project demonstrates several advanced AWS architecture patterns:

- **Serverless Event-Driven Architecture**: Using Lambda functions triggered by API Gateway
- **Infrastructure as Code**: Complete AWS infrastructure defined in SAM template
- **Binary Dependency Management**: Using Lambda Layers for FFmpeg and yt-dlp
- **Resource Lifecycle Management**: Automated cleanup of temporary resources
- **Separation of Concerns**: Modular Lambda functions with specific responsibilities
- **Cost Optimization**: Pay-per-use pricing model with auto-expiring resources 