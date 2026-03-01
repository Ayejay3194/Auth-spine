# Integration Examples

This directory contains integration examples for using Auth-Spine with various frameworks and platforms.

## Available Examples

### Frontend Frameworks
- **React**: `react-integration/` - React SPA with JWT authentication

### Coming Soon
- Vue.js integration
- Angular integration
- Express.js backend
- NestJS microservice
- React Native mobile app

## Common Integration Pattern

All examples follow this authentication flow:

```
1. User Login → POST /token
2. Store access_token & refresh_token
3. Include token in requests: Authorization: Bearer {token}
4. Handle token expiration
5. Refresh token: POST /token/refresh
6. Logout: POST /logout
```

## Security Best Practices

- Store tokens securely (httpOnly cookies for web)
- Implement token refresh before expiration
- Clear tokens on logout
- Use HTTPS in production
- Validate tokens on backend
