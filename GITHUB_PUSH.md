# Pushing Your YouTube to MP3 Converter to GitHub

Follow these steps to push your YouTube to MP3 Converter project to GitHub:

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "youtube-to-mp3-converter")
4. Add a description: "A web-based YouTube to MP3/WAV converter tool"
5. Choose "Public" visibility
6. Click "Create repository"

## Step 2: Initialize Git in Your Local Project

Open PowerShell in your project directory and run:

```powershell
cd "E:\Virtual Box VMs\YT to MP3 app\YT-to-MP3-Converter"
git init
```

## Step 3: Create a .gitignore File

Create a `.gitignore` file to exclude unnecessary files:

```powershell
@"
# Dependencies
/node_modules

# Generated files
/downloads/*
!downloads/.gitkeep

# Environment
.env
.env.local

# FFmpeg
/ffmpeg
/ffmpeg.exe
/ffmpeg.zip

# yt-dlp
/yt-dlp.exe

# Logs
*.log
npm-debug.log*

# OS specific
.DS_Store
Thumbs.db
"@ | Out-File -FilePath .gitignore -Encoding utf8
```

## Step 4: Add and Commit Your Files

```powershell
# Create an empty folder for downloads
mkdir -Force downloads
New-Item -ItemType File -Path "downloads\.gitkeep" -Force

# Add all files
git add .

# Commit the files
git commit -m "Initial commit: YouTube to MP3 Converter"
```

## Step 5: Connect to GitHub and Push

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/youtube-to-mp3-converter.git
git branch -M main
git push -u origin main
```

You'll need to enter your GitHub credentials when prompted.

## Optional: Use GitHub Desktop

If you prefer a graphical interface:

1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. In GitHub Desktop, choose "File" > "Add local repository"
3. Browse to your project folder and select it
4. Create the repository on GitHub with the "Publish repository" button
5. Add a repository name and description
6. Choose visibility (public or private)
7. Click "Publish repository"

## What's Being Pushed?

- Your server code (server.js)
- Frontend files (public folder)
- Project documentation (README.md, PROJECT_SUMMARY.md)
- Configuration files (package.json, Dockerfile, etc.)
- Helper scripts (push-to-notion.js)

The .gitignore file ensures that downloaded videos, node_modules, and other unnecessary files are not pushed to GitHub. 