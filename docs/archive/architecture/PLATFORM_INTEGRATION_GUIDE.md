# Platform Integration Guide

## Overview

The Auth-spine platform has been successfully enhanced with industry-agnostic platform modules from the Universal Professional Platform, V1 Suite, and Assistant Core Pack. This integration provides a comprehensive foundation for building vertical-specific applications.

## 🏗️ Architecture

### Core Platform Modules (`packages/enterprise/platform/`)

#### 1. Core Infrastructure
- **Types & Interfaces** (`core/types.ts`) - Industry-agnostic type definitions
- **Memory Store** (`core/store.ts`) - In-memory key-value storage
- **ID Generation** (`core/ids.ts`) - Unique ID generation utilities
- **Error Handling** (`core/errors.ts`) - Standardized error classes

#### 2. Business Logic Modules
- **Service Catalog** (`services/`) - Service management and discovery
- **Booking Engine** (`booking/`) - Appointment scheduling and management
- **Client Store** (`clients/`) - Customer profile management
- **Professional Store** (`professionals/`) - Service provider management
- **Pricing Engine** (`pricing/`) - Dynamic pricing and rules
- **Payment Service** (`payments/`) - Payment processing and refunds

#### 3. Intelligence & Analytics
- **Event Bus** (`events/`) - Event-driven architecture
- **Analytics Service** (`analytics/`) - Data tracking and reporting
- **NLU Service** (`nlu/`) - Natural language understanding
- **Prompt Builder** (`assistant/`) - AI response generation
- **Decision Engine** (`decision/`) - Automated decision making

#### 4. Platform Orchestrator
- **Main Orchestrator** (`PlatformOrchestrator.ts`) - Central coordination of all modules

## 🚀 Features Implemented

### Universal Professional Platform Features
✅ **Service Management** - Create and manage services across verticals
✅ **Booking System** - Complete appointment workflow with availability checking
✅ **Client Management** - Customer profiles and preferences
✅ **Professional Management** - Service provider profiles and vertical assignment
✅ **Dynamic Pricing** - Rule-based pricing with adjustments
✅ **Payment Processing** - Payment intents, processing, and refunds
✅ **Vertical Configuration** - Industry-specific settings and compliance

### V1 Suite Intelligence Features
✅ **Event Bus** - Publish/subscribe event system
✅ **Analytics Tracking** - Comprehensive event analytics and reporting
✅ **NLU Engine** - Intent recognition and entity extraction
✅ **Decision Engine** - Rule-based automated decisions
✅ **Prompt Builder** - Context-aware AI response generation

### Assistant Core Pack Features
✅ **NLU Training** - Pattern-based intent recognition
✅ **Intent Routing** - Automatic action determination
✅ **Prompt Building** - Dynamic prompt generation with examples
✅ **Context Management** - Conversation state and history

## 📡 API Endpoints

### Platform Management
- `GET /api/platform` - Platform status and health
- `POST /api/platform` - Data export/import operations

### Client Management
- `GET /api/platform/clients` - List/search clients
- `POST /api/platform/clients` - Create new client

### Professional Management
- `GET /api/platform/professionals` - List/search professionals by vertical
- `POST /api/platform/professionals` - Create new professional

### Service Management
- `GET /api/platform/services` - List/search services
- `POST /api/platform/services` - Create new service

### Booking Management
- `GET /api/platform/bookings` - List/search bookings
- `POST /api/platform/bookings` - Create new booking
- `PUT /api/platform/bookings/[id]` - Update booking (confirm/cancel/complete)
- `GET /api/platform/availability` - Check time slot availability

### AI Assistant
- `POST /api/platform/assistant/chat` - Process messages with NLU and decision engine

### Analytics
- `GET /api/platform/analytics` - Generate reports and export data
- `POST /api/platform/analytics` - Track custom events

### Vertical Configuration
- `GET /api/platform/verticals` - List vertical configurations
- `POST /api/platform/verticals` - Load new vertical configuration

## 🎯 Default Verticals

### Beauty & Wellness
- Services: Haircut, Color, Manicure
- Compliance: Verification required, 365-day retention
- Payment: Card, Cash accepted

### Fitness & Training
- Services: Personal Training, Virtual Training, Group Classes
- Compliance: Verification required, 730-day retention
- Payment: Card, Bank transfer accepted

### Professional Consulting
- Services: Strategy, Business Analysis, Quick Consultation
- Compliance: No verification required, 1825-day retention
- Payment: Card, Bank, Invoice accepted

## 🧪 Testing

### Demo Interface
Access the interactive demo at `/platform-demo` to test all features:

1. **Platform Status** - View system health and statistics
2. **Client Management** - Create and manage customer profiles
3. **Professional Management** - Add service providers by vertical
4. **Service Management** - Create services with pricing
5. **Booking System** - Complete booking workflow
6. **AI Assistant** - Test NLU and decision engine
7. **Analytics** - View system analytics (coming soon)

### API Testing Examples

```bash
# Get platform status
curl http://localhost:3000/api/platform

# Create a client
curl -X POST http://localhost:3000/api/platform/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"555-0123"}'

# Create a professional
curl -X POST http://localhost:3000/api/platform/professionals \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","email":"jane@example.com","vertical":"beauty","bio":"Expert hairstylist"}'

# Test AI assistant
curl -X POST http://localhost:3000/api/platform/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"I want to book a haircut for tomorrow","clientId":"client_id"}'
```

## 🔧 Configuration

### Environment Variables
No additional environment variables required - modules use in-memory storage by default.

### Custom Vertical Configuration
```javascript
const customVertical = {
  vertical: "custom-vertical",
  displayName: "Custom Industry",
  serviceTemplates: [
    {
      name: "Custom Service",
      defaultDurationMin: 60,
      defaultPriceCents: 10000,
      locationType: "virtual"
    }
  ],
  compliance: {
    requiresVerification: false,
    dataRetentionDays: 365,
    allowedPaymentMethods: ["card"]
  }
};

platform.loadVerticalConfig(customVertical);
```

## 📊 Data Models

### Core Entities
- **Client** - Customer profiles with preferences
- **Professional** - Service providers with vertical assignment
- **Service** - Offered services with pricing and duration
- **Booking** - Appointments with status tracking
- **PaymentIntent** - Payment processing with status
- **Event** - Analytics events with metadata

### Intelligence Models
- **NLUIntent** - Recognized intent with confidence and entities
- **DecisionResponse** - Automated decisions with reasoning
- **PromptContext** - Context for AI response generation

## 🔄 Integration Points

### With Existing Auth-Spine
- Uses existing Next.js app structure
- Compatible with existing authentication system
- Integrates with existing UI components
- Follows established API patterns

### Database Integration (Planned)
- Currently uses in-memory storage
- Prisma integration planned for persistence
- Migration utilities for data export/import
- Backup and restore capabilities

### External Services
- Payment provider integration (Stripe-ready)
- Calendar system integration
- Email notification system
- SMS notification capabilities

## 🚀 Deployment

### Development
```bash
cd apps/business-spine
npm install
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker Support
The platform modules are container-ready and can be deployed as microservices if needed.

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] Prisma database integration
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] API rate limiting
- [ ] Advanced security features

### Phase 3 Features
- [ ] Machine learning integration
- [ ] Advanced scheduling algorithms
- [ ] Multi-currency support
- [ ] International expansion features
- [ ] Mobile app support

## 📚 Documentation

- **API Reference** - See individual endpoint documentation
- **Type Definitions** - `packages/enterprise/platform/core/types.ts`
- **Examples** - Check the `/platform-demo` page
- **Architecture** - See individual module files for detailed documentation

## 🤝 Contributing

When adding new features:

1. Follow the established module pattern
2. Add comprehensive TypeScript types
3. Include error handling and validation
4. Add API endpoints following the REST pattern
5. Update the demo interface
6. Add tests and documentation

## 📞 Support

For questions about the platform integration:
- Check the demo interface at `/platform-demo`
- Review the API endpoints documentation
- Examine the type definitions in `core/types.ts`
- Test with the provided curl examples

---

**Status**: ✅ **Integration Complete** - All core features implemented and tested
**Next Steps**: Database integration and advanced analytics
