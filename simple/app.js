// Simple Lambda function for testing deployment
exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'YouTube MP3 Converter API is working!',
      input: event,
    }),
  };
  return response;
}; 