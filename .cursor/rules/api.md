# API Standards

Use REST conventions.

Response format:

{
  success: boolean,
  message: string,
  data: object | array | null,
  errors: object | null
}

HTTP Status Codes:

200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

Never expose internal error messages.

Always return meaningful messages.