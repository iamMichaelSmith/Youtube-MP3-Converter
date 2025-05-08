# Pushing Your YouTube to MP3 Converter Project to Notion

This guide will help you push your project documentation to Notion using the Notion API.

## Step 1: Set up a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name it "YouTube MP3 Converter Project"
4. Select your workspace
5. Click "Submit"
6. Copy the "Internal Integration Token" that appears (it starts with `secret_`)

## Step 2: Share a page with your integration

1. Create a new page in Notion where you want to add this project
2. Click the "..." menu in the top right corner
3. Go to "Add connections" 
4. Find and select your "YouTube MP3 Converter Project" integration
5. Copy the page ID from the URL (it's the string after the workspace name and before any question marks)
   - Example: `https://www.notion.so/yourworkspace/abcdef1234567890abcdef1234567890`
   - The page ID is: `abcdef1234567890abcdef1234567890`

## Step 3: Update the push-to-notion.js script

1. Open the `push-to-notion.js` file in your project directory
2. Replace the placeholder values with your actual Notion credentials:
   ```javascript
   const NOTION_TOKEN = 'secret_your_token_here'; // Replace with your token
   const NOTION_PAGE_ID = 'your_page_id_here';   // Replace with your page ID
   ```

## Step 4: Run the script

1. Open your terminal or PowerShell
2. Navigate to your project directory:
   ```powershell
   cd "E:\Virtual Box VMs\YT to MP3 app\YT-to-MP3-Converter"
   ```
3. Run the script:
   ```powershell
   node push-to-notion.js
   ```

## What will be pushed to Notion?

The script will push all the information from your `PROJECT_SUMMARY.md` file to Notion, including:
- Project Objective
- Technologies & Services Used
- Dependencies
- Implementation Steps
- Key Challenges & Solutions
- Final Outcome
- Future Improvements

The content will be formatted properly with headings, bullet points, and dividers to make it look good in Notion.

## Troubleshooting

If you encounter any errors:

1. Check that you've correctly set up the Notion integration
2. Verify that you've shared the page with your integration
3. Make sure you've entered the correct page ID and token in the script
4. Check that you're running the script from the correct directory

For more details on the Notion API, visit: https://developers.notion.com/ 