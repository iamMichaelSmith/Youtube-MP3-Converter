const fs = require('fs');
const path = require('path');
const https = require('https');

// Replace these with your actual values
const NOTION_TOKEN = 'secret_your_token_here';
const NOTION_PAGE_ID = 'your_page_id_here';

// Read the project summary
const projectSummary = fs.readFileSync(
  path.join(__dirname, 'PROJECT_SUMMARY.md'),
  'utf8'
);

// Parse the project summary into sections
const sections = projectSummary.split('## ').filter(Boolean);

// Create blocks for Notion
const blocks = [];

// Add title block
blocks.push({
  object: 'block',
  type: 'heading_1',
  heading_1: {
    rich_text: [{ type: 'text', text: { content: 'YouTube to MP3/WAV Converter Project' } }]
  }
});

// Process each section
sections.forEach(section => {
  const lines = section.split('\n').filter(line => line.trim());
  const sectionTitle = lines[0].trim();
  
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: sectionTitle } }]
    }
  });
  
  // Add divider after title
  blocks.push({
    object: 'block',
    type: 'divider',
    divider: {}
  });
  
  // Process the content
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Handle bullet points
    if (line.startsWith('- ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: line.slice(2) } }]
        }
      });
    } 
    // Handle subsections (###)
    else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: line.slice(4) } }]
        }
      });
    }
    // Regular paragraph
    else {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: line } }]
        }
      });
    }
  }
  
  // Add space between sections
  blocks.push({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: '' } }]
    }
  });
});

// Function to send blocks to Notion (in chunks to avoid size limits)
function sendToNotion(blocks) {
  // Notion API has a limit on how many blocks can be sent at once
  const MAX_BLOCKS_PER_REQUEST = 50;
  const totalBlocks = blocks.length;
  let blocksSent = 0;
  
  function sendChunk() {
    const chunk = blocks.slice(blocksSent, blocksSent + MAX_BLOCKS_PER_REQUEST);
    if (chunk.length === 0) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        children: chunk
      });
      
      const options = {
        hostname: 'api.notion.com',
        path: `/v1/blocks/${NOTION_PAGE_ID}/children`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            blocksSent += chunk.length;
            console.log(`Sent ${blocksSent}/${totalBlocks} blocks`);
            
            if (blocksSent < totalBlocks) {
              // Wait a bit to avoid rate limits
              setTimeout(sendChunk, 500);
            }
            resolve(JSON.parse(responseData));
          } else {
            console.error('Error response:', responseData);
            reject(new Error(`Request failed with status code ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('Error making request:', error);
        reject(error);
      });
      
      req.write(data);
      req.end();
    });
  }
  
  return sendChunk();
}

console.log(`Pushing ${blocks.length} blocks to Notion...`);
sendToNotion(blocks)
  .then(() => console.log('Successfully pushed project to Notion!'))
  .catch(error => console.error('Failed to push to Notion:', error)); 