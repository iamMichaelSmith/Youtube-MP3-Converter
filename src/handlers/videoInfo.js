const { URL } = require('url');
const https = require('https');
const fetch = require('node-fetch');

// Direct function to get video ID from various YouTube URL formats
function extractVideoID(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Get video thumbnail by ID
function getVideoThumbnail(videoId) {
  // Return highest quality thumbnail URL
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Fallback method to get basic video info
async function getBasicVideoInfo(url) {
  return new Promise((resolve, reject) => {
    const videoId = extractVideoID(url);
    
    if (!videoId) {
      return reject(new Error('Invalid YouTube URL'));
    }
    
    const thumbnailUrl = getVideoThumbnail(videoId);
    console.log(`Using video ID: ${videoId}, thumbnail URL: ${thumbnailUrl}`);
    
    // Create a basic response with default values
    const basicResponse = {
      title: `YouTube Video ${videoId}`,
      author: "YouTube Channel",
      lengthSeconds: 180,
      thumbnail: thumbnailUrl,
      videoId: videoId
    };
    
    // Try to get more info by scraping the page
    try {
      // Fetch YouTube page to scrape title
      const requestOptions = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 15000 // 15 seconds timeout
      };
      
      console.log(`Fetching YouTube page for video ID: ${videoId}`);
      
      fetch(`https://www.youtube.com/watch?v=${videoId}`, requestOptions)
        .then(response => {
          if (response.status !== 200) {
            console.log(`YouTube returned status ${response.status}, using basic info`);
            return resolve(basicResponse);
          }
          return response.text();
        })
        .then(data => {
          if (!data || data.length < 1000) {
            console.log(`Received insufficient data, using basic info`);
            return resolve(basicResponse);
          }
          
          console.log(`Received ${data.length} bytes of data, parsing...`);
          
          // Try to extract title
          let title = basicResponse.title;
          let author = basicResponse.author;
          let duration = basicResponse.lengthSeconds;
          
          const titleMatch = data.match(/<title>([^<]*)<\/title>/);
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].replace(' - YouTube', '').trim();
            console.log(`Extracted title: ${title}`);
          }
          
          // Try to extract channel name
          const authorMatch = data.match(/"ownerChannelName":"([^"]*)"/);
          if (authorMatch && authorMatch[1]) {
            author = authorMatch[1];
            console.log(`Extracted author: ${author}`);
          }
          
          // Try to extract duration
          const durationMatch = data.match(/"lengthSeconds":"([^"]*)"/);
          if (durationMatch && durationMatch[1]) {
            duration = parseInt(durationMatch[1]) || duration;
            console.log(`Extracted duration: ${duration} seconds`);
          }
          
          resolve({
            title: title,
            author: author,
            lengthSeconds: duration,
            thumbnail: thumbnailUrl,
            videoId: videoId
          });
        })
        .catch(err => {
          console.error('Error fetching YouTube page:', err);
          resolve(basicResponse);
        });
    } catch (err) {
      console.error('Exception in getBasicVideoInfo:', err);
      resolve(basicResponse);
    }
  });
}

// Lambda handler
exports.handler = async (event) => {
  try {
    // Extract URL from query parameters
    const url = event.queryStringParameters?.url;
    
    console.log(`Received info request for URL: ${url}`);
    
    if (!url) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'URL is required' })
      };
    }
    
    // Validate the URL format (simple check)
    try {
      new URL(url); // Will throw if URL is invalid
    } catch (error) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid URL format' })
      };
    }
    
    // Get video information
    const videoInfo = await getBasicVideoInfo(url);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(videoInfo)
    };
  } catch (error) {
    console.error('Error in video info handler:', error);
    
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to get video information',
        details: error.message
      })
    };
  }
}; 