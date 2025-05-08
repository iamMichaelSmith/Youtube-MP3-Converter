const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Table name from environment variable
const PROGRESS_TABLE = process.env.PROGRESS_TABLE || 'youtube-mp3-converter-progress-dev';
const S3_BUCKET = process.env.S3_BUCKET;

// Lambda handler
exports.handler = async (event) => {
  try {
    // Extract download ID from path parameter
    const downloadId = event.pathParameters?.downloadId;
    
    if (!downloadId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Download ID is required' })
      };
    }
    
    // Get progress from DynamoDB
    const params = {
      TableName: PROGRESS_TABLE,
      Key: { downloadId }
    };
    
    console.log(`Fetching progress for download ID: ${downloadId}`);
    
    const result = await dynamodb.get(params).promise();
    const progressRecord = result.Item;
    
    if (!progressRecord) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Download not found' })
      };
    }
    
    // If status is 'completed', generate a presigned URL for downloading
    if (progressRecord.status === 'completed' && progressRecord.s3Key) {
      // Generate a presigned URL
      const s3Params = {
        Bucket: S3_BUCKET,
        Key: progressRecord.s3Key,
        Expires: 3600 // URL expires in 1 hour
      };
      
      const downloadUrl = await s3.getSignedUrlPromise('getObject', s3Params);
      
      // Add the download URL to the response
      progressRecord.downloadUrl = downloadUrl;
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(progressRecord)
    };
  } catch (error) {
    console.error('Error retrieving progress:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to retrieve progress information',
        details: error.message
      })
    };
  }
}; 