# YouTube to MP3 Converter

A modern web application for downloading YouTube videos as MP3 audio files.

## ✅ Working Solution (Updated April 2025)

The application now uses yt-dlp to properly download YouTube audio. Key components of the working solution:

1. **Direct YouTube Audio Download**: Downloads actual audio from YouTube videos using yt-dlp
2. **No FFmpeg Dependency**: Modified to work without requiring FFmpeg conversion
3. **Automatic Tool Installation**: Downloads yt-dlp automatically if not present
4. **Multiple Fallback Methods**: Ensures downloads work even if one method fails

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

Then access the application at: http://localhost:3001

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

## Installation

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

1. Navigate to http://localhost:3001 in your browser
2. Enter a YouTube URL
3. Click "Fetch Info" to retrieve the video details
4. Click "Convert" to download the MP3 file

## Technical Details

### Frontend
- HTML5, CSS3, JavaScript
- Responsive design
- Dark theme UI

### Backend
- Node.js with Express.js
- YouTube data extraction using yt-dlp
- Direct stream downloading

### Docker Container
- Node.js 18 slim image
- Automatic installation of yt-dlp
- Volume mapping for downloads folder

## Legal Notice

This application is for personal use only. Please respect copyright laws and YouTube's terms of service. The developers are not responsible for any misuse of this tool.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for providing the core downloading functionality
- Node.js and Express.js for the backend framework 