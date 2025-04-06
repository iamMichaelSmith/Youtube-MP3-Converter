# Step-by-Step Guide: Push YouTube to MP3 Converter to GitHub

Follow these steps to create a GitHub repository and push your project to it:

## Step 1: Create a Repository on GitHub

1. Log in to your GitHub account at [github.com](https://github.com)
2. Click the "+" icon in the top-right corner and select "New repository"
3. Enter repository details:
   - Repository name: `youtube-to-mp3-converter`
   - Description: `A web-based YouTube to MP3/WAV converter tool`
   - Visibility: Public
   - **Do NOT** initialize with README, .gitignore, or license files
4. Click "Create repository"

## Step 2: Copy the Repository URL

After creating the repository, you'll see a page with setup instructions. Find and copy your repository URL, which will look like:
```
https://github.com/YOUR-USERNAME/youtube-to-mp3-converter.git
```

## Step 3: Connect Your Local Repository to GitHub

Open PowerShell in your project directory and run:

```powershell
# Set the remote repository URL (replace YOUR-USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/youtube-to-mp3-converter.git

# Rename the main branch to 'main' (if it's not already called that)
git branch -M main
```

## Step 4: Push Your Code to GitHub

```powershell
# Push your code to GitHub
git push -u origin main
```

When prompted for authentication:
- Username: Enter your GitHub username
- Password: **Use your personal access token** (not your GitHub password)

## Step 5: Verify Your Repository on GitHub

1. Go to `https://github.com/YOUR-USERNAME/youtube-to-mp3-converter`
2. Confirm that all your files are now visible in the repository

## Troubleshooting

- **Authentication Failed**: Make sure you're using your personal access token as the password, not your GitHub account password.
- **Repository Not Found**: Double-check that you've created the repository on GitHub and that the URL is correct.
- **Permission Denied**: Ensure your personal access token has the correct permissions (repo scope).
- **Failed to Push**: If you get errors about the remote containing work you don't have locally, you may need to pull first with `git pull --rebase origin main`.

## Next Steps After Successful Push

- Set up GitHub Pages to host your application (if applicable)
- Add collaborators to your repository
- Create issues for future enhancements
- Set up GitHub Actions for automated testing/deployment 