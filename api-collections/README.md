# API Collections

This directory contains API collections for testing Auth-Spine endpoints.

## Available Collections

### Postman Collection
- **File**: `auth-spine-postman.json`
- **Import**: Open Postman → Import → Select this file
- **Usage**: Pre-configured requests for all Auth-Spine endpoints

## Quick Start

### Using Postman

```bash
# Import the collection
Open Postman → File → Import → auth-spine-postman.json

# Set variables
base_url: http://localhost:4000
test_email: test@example.com
test_password: TestPass123!

# Run requests
Collections → Auth-Spine → Select request → Send
```

### Using cURL

```bash
# Health check
curl http://localhost:4000/health

# Login
curl -X POST http://localhost:4000/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "client_id": "business-spine-app"
  }'

# Get user info (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/oauth/userinfo
```

## Environment Variables

- `base_url`: Auth server URL (default: http://localhost:4000)
- `access_token`: Automatically set after login

## Security

⚠️ Never commit sensitive data:
- Don't store real passwords in collections
- Don't commit tokens or secrets
- Use environment variables for production
