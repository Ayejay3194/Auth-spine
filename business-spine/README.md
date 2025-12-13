# Business Spine - Plug & Play Smart Assistant Framework

A comprehensive, modular business spine with integrated smart assistant capabilities. Built for rapid deployment and easy customization.

## Features

- 🚀 **Plug-and-Play Architecture** - Easy module and plugin installation
- 🤖 **Smart Assistant Integration** - AI-powered business insights and automation
- 📊 **Multi-Domain Support** - Booking, CRM, Payments, Marketing, Analytics, Security
- 🔧 **RESTful API** - Complete HTTP API for integration
- 🛡️ **Enterprise Security** - Role-based access control, audit logging
- 📈 **Real-time Analytics** - Built-in business intelligence
- 🔌 **Extensible Plugin System** - Add custom business logic easily

## Quick Start

### Installation

```bash
# Clone and install
git clone <repository-url>
cd business-spine
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Build and start
npm run build
npm start
```

### Basic Usage

```javascript
import { createBusinessSpine, startServer } from './src/index.js';

// Create spine with default configuration
const spine = await createBusinessSpine();

// Start API server
const server = await startServer(spine);

console.log('Business Spine running on port 3000');
```

## Architecture

### Core Components

- **BusinessSpine** - Main orchestrator and plugin manager
- **Orchestrator** - Intent detection and flow execution
- **SmartAssistant** - AI-powered suggestion engine
- **ApiServer** - RESTful API layer
- **PluginManager** - Dynamic plugin loading system

### Business Modules (Spines)

1. **Booking** - Appointment scheduling, calendar management
2. **CRM** - Customer relationship management
3. **Payments** - Payment processing, invoicing
4. **Marketing** - Campaign management, automation
5. **Analytics** - Business intelligence, reporting
6. **Admin/Security** - User management, security policies

### Smart Engines

- **Predictive Scheduling** - Optimizes appointment booking
- **Client Behavior Analysis** - Identifies at-risk clients, opportunities
- **Dynamic Pricing** - Intelligent pricing recommendations
- **Segmentation** - Customer grouping and targeting

## API Documentation

### Chat Endpoint

```http
POST /assistant/chat
Content-Type: application/json

{
  "message": "Schedule a meeting for tomorrow at 2pm",
  "context": {
    "actor": { "userId": "user123", "role": "staff" },
    "tenantId": "tenant123",
    "timezone": "America/New_York"
  }
}
```

### Intent Detection

```http
POST /assistant/intent
Content-Type: application/json

{
  "message": "Cancel my appointment",
  "context": { "actor": { "userId": "user123", "role": "client" } }
}
```

### Smart Suggestions

```http
POST /assistant/suggestions
Content-Type: application/json

{
  "context": {
    "actor": { "userId": "user123", "role": "staff" },
    "practitioner": { "id": "staff123", "displayName": "John Doe" },
    "bookings": [...],
    "clients": [...]
  }
}
```

## Configuration

### Environment Variables

```bash
TENANT_ID=your-tenant-id
PORT=3000
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000
ASSISTANT_ENABLED=true
```

### Module Configuration

```json
{
  "modules": [
    {
      "name": "booking",
      "enabled": true,
      "settings": {
        "autoReminders": true,
        "bufferTime": 15
      }
    }
  ],
  "assistant": {
    "enabled": true,
    "engines": ["predictive_scheduling", "client_behavior"]
  }
}
```

## Plugin Development

### Creating a Plugin

```javascript
import { Plugin, BusinessSpine } from './src/core/types.js';

export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom business logic',
  dependencies: ['booking'],

  async install(spine: BusinessSpine): Promise<void> {
    // Register custom tools
    spine.registerTool('my_tool', async ({ ctx, input }) => {
      return { ok: true, data: { result: 'success' } };
    });

    // Register custom spine
    spine.registerSpine({
      name: 'my_business_logic',
      description: 'Custom business processes',
      version: '1.0.0',
      detectIntent: (text, ctx) => { /* ... */ },
      extractEntities: (intent, text, ctx) => { /* ... */ },
      buildFlow: (intent, extraction, ctx) => { /* ... */ }
    });
  }
};
```

### Installing Plugins

```javascript
import myPlugin from './plugins/my-plugin/index.js';

await spine.installPlugin(myPlugin);
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  business-spine:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
    depends_on:
      - postgres
      - redis
```

## Security

- Role-based access control (RBAC)
- JWT authentication
- Audit logging with hash chaining
- Input validation and sanitization
- Rate limiting
- CORS protection

## Monitoring

- Structured logging (JSON format)
- Health check endpoints
- Performance metrics
- Error tracking
- Audit trails

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [link to docs]
- Issues: [link to GitHub issues]
- Community: [link to Discord/Slack]
