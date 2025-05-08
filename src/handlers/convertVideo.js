const AWS = require('aws-sdk');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Constants
const PROGRESS_TABLE = process.env.PROGRESS_TABLE || 'youtube-mp3-converter-progress-dev';
const S3_BUCKET = process.env.S3_BUCKET;
const TEMP_DIR = '/tmp'; // Lambda temp directory
const BIN_DIR = process.env.LAMBDA_TASK_ROOT ? '/opt/bin' : path.join(__dirname, '..', '..', 'bin');

// Helper functions
function generateRandomId() {
  return crypto.randomBytes(16).toString('hex');
}

// Update progress in DynamoDB
async function updateProgress(downloadId, progress, status, error = null, s3Key = null, fileName = null) {
  const now = Math.floor(Date.now() / 1000);
  const expiryTime = now + 86400; // 24 hours from now
  
  const params = {
    TableName: PROGRESS_TABLE,
    Item: {
      downloadId,
      progress,
      status,
      updatedAt: now,
      expiryTime
    }
  };
  
  if (error) {
    params.Item.error = error;
  }
  
  if (s3Key) {
    params.Item.s3Key = s3Key;
  }
  
  if (fileName) {
    params.Item.fileName = fileName;
  }
  
  await dynamodb.put(params).promise();
}

// Download audio using yt-dlp
function downloadYouTubeAudio(url, outputPath, format = 'mp3') {
  return new Promise((resolve, reject) => {
    const ytDlpPath = path.join(BIN_DIR, 'yt-dlp');
    const ffmpegPath = path.join(BIN_DIR, 'ffmpeg');
    
    console.log(`yt-dlp path: ${ytDlpPath}`);
    console.log(`ffmpeg path: ${ffmpegPath}`);
    
    // Make binaries executable
    try {
      fs.chmodSync(ytDlpPath, '755');
      fs.chmodSync(ffmpegPath, '755');
    } catch (error) {
      console.warn('Could not change permissions on binaries:', error);
    }
    
    const args = [
      '--no-playlist',
      '--extract-audio',
      `--audio-format=${format}`,
      '--audio-quality=0', // Best quality
      '--ffmpeg-location', ffmpegPath,
      '-o', outputPath,
      url
    ];
    
    console.log(`Executing: ${ytDlpPath} ${args.join(' ')}`);
    
    const ytDlp = spawn(ytDlpPath, args);
    let stdoutData = '';
    let stderrData = '';
    let progress = 0;
    
    ytDlp.stdout.on('data', (data) => {
      const output = data.toString();
      stdoutData += output;
      
      // Parse progress information
      const downloadMatch = output.match(/(\d+\.\d+)% of ~?\s*(\d+\.\d+)(\w+) at\s*(\d+\.\d+)(\w+)\/s/);
      if (downloadMatch) {
        progress = parseFloat(downloadMatch[1]);
        console.log(`Download progress: ${progress}%`);
      }
      
      // Parse post-processing progress
      if (output.includes('Extracting audio')) {
        progress = 80;
        console.log('Extracting audio...');
      }
      
      if (output.includes('Deleting original file')) {
        progress = 90;
        console.log('Finalizing...');
      }
    });
    
    ytDlp.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    ytDlp.on('close', (code) => {
      if (code === 0) {
        resolve(progress);
      } else {
        console.error(`yt-dlp exited with code ${code}`);
        console.error(`stdout: ${stdoutData}`);
        console.error(`stderr: ${stderrData}`);
        reject(new Error(`YouTube download failed with code ${code}: ${stderrData}`));
      }
    });
    
    ytDlp.on('error', (err) => {
      console.error('Failed to start yt-dlp process:', err);
      reject(err);
    });
  });
}

// Lambda handler
exports.handler = async (event) => {
  let downloadId = null;
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const url = body.url;
    const format = body.format || 'mp3';
    
    if (!url) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'YouTube URL is required' })
      };
    }
    
    // Generate a unique download ID
    downloadId = generateRandomId();
    
    // Generate a unique filename
    const videoId = url.match(/v=([^&]+)/)?.[1] || downloadId;
    const filename = `${videoId}.${format}`;
    const tempFilePath = path.join(TEMP_DIR, filename);
    const s3Key = `downloads/${filename}`;
    
    console.log(`Starting conversion for URL: ${url}, download ID: ${downloadId}`);
    
    // Initialize progress in DynamoDB
    await updateProgress(downloadId, 0, 'initializing');
    
    // Start async processing
    // Note: For Lambda, we need to do the work before responding
    //       In a production environment, we might use a Step Function
    //       or EventBridge to coordinate long-running tasks
    
    // Update progress to downloading
    await updateProgress(downloadId, 10, 'downloading');
    
    try {
      // Execute YouTube download
      await downloadYouTubeAudio(url, tempFilePath, format);
      
      // Check if file exists
      if (!fs.existsSync(tempFilePath)) {
        throw new Error('Downloaded file not found');
      }
      
      // Update progress to uploading
      await updateProgress(downloadId, 90, 'uploading');
      
      // Upload to S3
      await s3.upload({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: fs.createReadStream(tempFilePath),
        ContentType: format === 'mp3' ? 'audio/mpeg' : 'audio/wav'
      }).promise();
      
      // Update progress to completed
      await updateProgress(downloadId, 100, 'completed', null, s3Key, filename);
      
      console.log(`Conversion completed successfully: ${s3Key}`);
      
      // Clean up temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.warn('Error cleaning up temp file:', err);
      }
    } catch (processingError) {
      console.error('Error during processing:', processingError);
      await updateProgress(downloadId, 0, 'error', processingError.message);
      throw processingError;
    }
    
    // Return the download ID for tracking progress
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        downloadId,
        message: 'Conversion in progress. Use the progress endpoint to check status.'
      })
    };
  } catch (error) {
    console.error('Error in conversion handler:', error);
    
    // If we have a download ID, update the progress with the error
    if (downloadId) {
      try {
        await updateProgress(downloadId, 0, 'error', error.message);
      } catch (dbError) {
        console.error('Error updating progress with error state:', dbError);
      }
    }
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to process video',
        details: error.message
      })
    };
  }
}; 