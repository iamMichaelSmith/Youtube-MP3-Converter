# Complete GitHub Setup Guide for YouTube to MP3 Converter

This guide will walk you through installing Git, setting up your project, and pushing it to GitHub.

## Step 1: Install Git

1. Download Git for Windows: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Run the installer with default options (you can customize if needed)
3. After installation, open a new PowerShell window to make sure the PATH is updated

## Step 2: Configure Git

Open PowerShell and run:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Create a GitHub Account (if you don't have one)

1. Go to [https://github.com/signup](https://github.com/signup)
2. Follow the registration process

## Step 4: Create a New Repository on GitHub

1. Log in to GitHub
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name: `youtube-to-mp3-converter`
4. Description: "A web-based YouTube to MP3/WAV converter tool"
5. Make it Public
6. Do NOT initialize with README, .gitignore, or license (we'll push these from your local project)
7. Click "Create repository"

## Step 5: Prepare Your Local Project

1. Open PowerShell and navigate to your project:

```powershell
cd "E:\Virtual Box VMs\YT to MP3 app\YT-to-MP3-Converter"
```

2. Initialize Git repository:

```powershell
git init
```

3. Make sure your `.gitignore` file is set up correctly (should already be created)

4. Create an empty directory for downloads (to ensure it's included in the repository):

```powershell
# Create downloads directory if it doesn't exist
if (-not (Test-Path -Path "downloads")) {
    New-Item -ItemType Directory -Path "downloads"
}

# Create a .gitkeep file to ensure the directory is tracked
New-Item -ItemType File -Path "downloads\.gitkeep" -Force
```

## Step 6: Add and Commit Files

```powershell
# Check which files will be added
git status

# Add all files
git add .

# Commit the files
git commit -m "Initial commit: YouTube to MP3 Converter"
```

## Step 7: Link to GitHub and Push

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/youtube-to-mp3-converter.git
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub username and password. Note that GitHub no longer accepts passwords for command-line operations. Instead, you'll need to use a personal access token:

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Give it a name like "YouTube to MP3 Converter Push"
4. Select at least the "repo" scope
5. Click "Generate token"
6. Copy the token and use it as your password when prompted

## Step 8: Verify Your Repository

1. Go to `https://github.com/YOUR_USERNAME/youtube-to-mp3-converter`
2. Make sure all your files are there

## Alternative: Using GitHub Desktop

If you prefer a graphical interface:

1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. Open GitHub Desktop
3. Sign in to your GitHub account
4. Click on "File" > "Add local repository"
5. Browse to your project folder: `E:\Virtual Box VMs\YT to MP3 app\YT-to-MP3-Converter`
6. Click "Add repository"
7. Click "Publish repository" in the top-right
8. Fill in the name and description
9. Choose "Public" visibility
10. Click "Publish repository"

## Files That Will Be Pushed

- `server.js`: Main server code
- `package.json`: Dependencies list
- `public/`: Frontend files
- `README.md`: Project documentation
- `PROJECT_SUMMARY.md`: Detailed project information
- `Dockerfile` and `docker-compose.yml`: Docker configuration
- `NOTION.md`: Guide for Notion integration
- `push-to-notion.js`: Script for Notion integration
- `.gitignore`: Specifies which files not to track

## Troubleshooting

- If you get authentication errors, make sure you're using a personal access token instead of your GitHub password
- If certain files aren't being tracked, check your `.gitignore` file
- If the push fails with "non-fast-forward" errors, you may need to pull first with `git pull --rebase origin main` 