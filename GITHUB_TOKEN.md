# Creating a GitHub Personal Access Token

Follow these steps to create a personal access token (PAT) you can use to authenticate with GitHub from the command line:

## Step 1: Access Token Settings on GitHub

1. Log in to your GitHub account at [github.com](https://github.com)
2. Click on your profile picture in the top right corner
3. Select "Settings" from the dropdown menu
4. Scroll down in the left sidebar and click on "Developer settings"
5. In the left sidebar, click on "Personal access tokens"
6. Click on "Tokens (classic)" or "Fine-grained tokens" (we recommend "Tokens (classic)" for simplicity)

## Step 2: Generate a New Token

1. Click "Generate new token" or "Generate new token (classic)"
2. Give your token a descriptive name (e.g., "YouTube MP3 Converter Project")
3. Set an expiration date (for security reasons, choose an appropriate expiration)

## Step 3: Select Token Permissions

For pushing code to a repository, you need at least these permissions:
- Under "Select scopes", check "repo" (full control of private repositories)
  - This automatically includes:
    - repo:status
    - repo_deployment
    - public_repo
    - repo:invite
    - security_events

## Step 4: Create and Copy Your Token

1. Scroll down and click "Generate token"
2. **IMPORTANT:** Copy your token immediately! GitHub will only show it once.
3. Store it securely (e.g., in a password manager)

## Step 5: Use Your Token for Git Operations

When pushing to GitHub for the first time, you'll be prompted for authentication:
- For username: enter your GitHub username
- For password: use your personal access token (not your GitHub password)

## Notes

- Keep your token secure - it grants access to your GitHub account
- If you believe your token has been compromised, revoke it immediately on GitHub
- You can create multiple tokens with different permissions for different projects
- Personal access tokens are a more secure alternative to using your password 