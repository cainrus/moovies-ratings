export default function createSuccessResponse(data: object) {
  return {
    statusCode: 200, // Success status code
    body: JSON.stringify(data),
  };
}
