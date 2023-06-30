export default function createErrorResponse({message='Internal server error occurred.'} = {}) {
  return {
    statusCode: 500, // Or other appropriate status code
    body: JSON.stringify({ message }),
  };
}
