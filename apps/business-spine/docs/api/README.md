# Auth-spine API Documentation

## Overview

Auth-spine provides a comprehensive REST API for enterprise authentication, authorization, and business operations. The API is built with Next.js 15, TypeScript, and follows OpenAPI 3.0 specifications.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /api/auth/logout
Logout user and invalidate token.

#### POST /api/auth/refresh
Refresh JWT token.

### User Management Endpoints

#### GET /api/users
Get all users (admin only).

#### GET /api/users/:id
Get user by ID.

#### PUT /api/users/:id
Update user information.

#### DELETE /api/users/:id
Delete user (admin only).

### RBAC Endpoints

#### GET /api/rbac/roles
Get all roles.

#### GET /api/rbac/permissions
Get all permissions.

#### POST /api/rbac/assign-role
Assign role to user.

#### POST /api/rbac/check-permission
Check user permission.

### Business Operations Endpoints

#### GET /api/analytics/dashboard
Get analytics dashboard data.

#### GET /api/financial/reports
Get financial reports.

#### GET /api/crm/customers
Get customer data.

#### POST /api/payments/process
Process payment.

### Enterprise Package Endpoints

#### GET /api/enterprise/health
Get enterprise package health status.

#### GET /api/enterprise/metrics
Get enterprise metrics.

#### POST /api/enterprise/initialize
Initialize enterprise packages.

### Audit & Compliance Endpoints

#### GET /api/audit/logs
Get audit logs.

#### GET /api/compliance/status
Get compliance status.

#### GET /api/governance/policies
Get governance policies.

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Business endpoints: 100 requests per minute
- Admin endpoints: 50 requests per minute

## Pagination

List endpoints support pagination:
```
GET /api/users?page=1&limit=20&sort=createdAt&order=desc
```

## Webhooks

Configure webhooks for real-time events:
- User registration
- Payment processing
- Compliance alerts

## SDK & Libraries

- JavaScript/TypeScript SDK
- Python SDK
- React components

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
```
GET /api/docs/openapi.json
```

Interactive API documentation:
```
GET /api/docs
```

## Support

For API support and questions:
- Documentation: [API Docs](./)
- Examples: [Examples](./examples/)
- Support: support@auth-spine.com
