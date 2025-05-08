const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1'
});

// Initialize AWS services
const s3 = new AWS.S3();
const lambda = new AWS.Lambda();

// Bucket configurations
const BUCKET_NAME = 'youtube-mp3-converter-files';

// Lambda function configurations
const CONVERSION_LAMBDA = 'youtube-mp3-conversion-function';

/**
 * Upload a file to S3
 * @param {Buffer|ReadStream} fileContent - The file content to upload
 * @param {string} fileName - The name of the file in S3
 * @returns {Promise<string>} - The S3 URL of the uploaded file
 */
const uploadToS3 = async (fileContent, fileName) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileContent
  };
  
  try {
    const result = await s3.upload(params).promise();
    console.log(`File uploaded successfully to ${result.Location}`);
    return result.Location;
  } catch (err) {
    console.error('Error uploading to S3:', err);
    throw err;
  }
};

/**
 * Generate a presigned URL for downloading a file
 * @param {string} fileName - The name of the file in S3
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
 * @returns {Promise<string>} - The presigned URL
 */
const getPresignedUrl = async (fileName, expiresIn = 3600) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Expires: expiresIn
  };
  
  try {
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    throw err;
  }
};

/**
 * Delete a file from S3
 * @param {string} fileName - The name of the file to delete
 * @returns {Promise<void>}
 */
const deleteFromS3 = async (fileName) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName
  };
  
  try {
    await s3.deleteObject(params).promise();
    console.log(`File ${fileName} deleted successfully from S3`);
  } catch (err) {
    console.error('Error deleting file from S3:', err);
    throw err;
  }
};

module.exports = {
  AWS,
  s3,
  BUCKET_NAME,
  uploadToS3,
  getPresignedUrl,
  deleteFromS3,
  lambda,
  CONVERSION_LAMBDA
}; 