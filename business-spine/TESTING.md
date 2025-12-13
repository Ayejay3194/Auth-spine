# Business Spine Testing Guide

## Overview
This document describes the comprehensive testing strategy for the Business Spine system, including unit tests, integration tests, routing tests, and organization validation.

## Test Suites

### 1. Integration Tests (`test/integration.ts`)
Validates core functionality and system connections.

**Coverage:**
- ✅ BusinessSpine initialization
- ✅ Spine connections and loading
- ✅ Smart assistant integration
- ✅ Tool execution
- ✅ Plugin system

**Run:**
```bash
npx ts-node test/integration.ts
```

### 2. Final Validation (`test/final-validation.ts`)
Production readiness checks with performance metrics.

**Coverage:**
- ✅ Build validation
- ✅ Initialization performance
- ✅ Spine loading
- ✅ Intent detection
- ✅ Tool execution
- ✅ Plugin system
- ✅ Error handling
- ✅ Configuration

**Run:**
```bash
npx ts-node test/final-validation.ts
```

### 3. Routing Tests (`test/routing.test.ts`)
Validates API routes and endpoint configuration.

**Coverage:**
- ✅ API route definitions
- ✅ Spine routing
- ✅ Tool routing
- ✅ Plugin routing

**Run:**
```bash
npx ts-node test/routing.test.ts
```

### 4. Organization Tests (`test/organization.test.ts`)
Validates code structure and organization.

**Coverage:**
- ✅ Directory structure
- ✅ Spine organization
- ✅ Module exports
- ✅ Type definitions
- ✅ Configuration files

**Run:**
```bash
npx ts-node test/organization.test.ts
```

## Running All Tests

```bash
# Build the project
npm run build

# Run all tests
npm test

# Or run individual test suites
npx ts-node test/integration.ts
npx ts-node test/final-validation.ts
npx ts-node test/routing.test.ts
npx ts-node test/organization.test.ts
```

## Test Results Summary

### Current Status: ✅ ALL TESTS PASSING

- **Integration Tests**: 5/5 passed
- **Final Validation**: 8/8 passed
- **Routing Tests**: All routes validated
- **Organization Tests**: 32/32 checks passed

## Code Coverage

### Core Framework
- `src/core/business-spine.ts` - Main orchestrator
- `src/core/orchestrator.ts` - Intent detection and flow execution
- `src/core/policy.ts` - Access control and policies
- `src/core/flow.ts` - Flow execution engine
- `src/core/types.ts` - Type definitions

### Business Spines
- `src/spines/booking/` - Appointment management
- `src/spines/crm/` - Customer relationship management
- `src/spines/payments/` - Payment processing
- `src/spines/marketing/` - Marketing campaigns
- `src/spines/analytics/` - Business intelligence
- `src/spines/admin_security/` - Administration and security

### Smart Assistant
- `src/smart/assistant.ts` - AI suggestion engine
- `src/smart/engines/` - Smart engines (predictive scheduling, client behavior)

### API Server
- `src/api/server.ts` - REST API endpoints

### Utilities
- `src/utils/logger.ts` - Logging system
- `src/adapters/memory.ts` - In-memory data storage

## Performance Metrics

- **Initialization Time**: ~40ms
- **Intent Detection**: ~0.05ms per query
- **Tool Execution**: ~0.03ms per call
- **Memory Usage**: Stable, no leaks detected

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

```bash
# Build and test
npm run build && npm test
```

All tests must pass before deployment.

## Troubleshooting

### Test Failures
1. Check build: `npm run build`
2. Verify dependencies: `npm install`
3. Clear cache: `rm -rf dist/`
4. Run tests: `npm test`

### Performance Issues
- Check system resources
- Review logs for errors
- Profile with Node.js inspector

## Future Testing

- Add unit tests for individual modules
- Implement E2E tests with Playwright
- Add load testing with k6
- Implement security testing
- Add accessibility testing

## Test Maintenance

- Update tests when adding new features
- Remove obsolete tests
- Keep test data realistic
- Document test assumptions
- Review test coverage quarterly
