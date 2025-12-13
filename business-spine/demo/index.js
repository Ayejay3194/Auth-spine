/**
 * Business Spine Demo
 * Demonstrates the plug-and-play capabilities with smart assistant integration
 */

const { createBusinessSpine } = require('../dist/index.js');

async function runDemo() {
  console.log('🚀 Starting Business Spine Demo...\n');

  // Create business spine with demo configuration
  const spine = await createBusinessSpine({
    tenantId: 'demo-tenant',
    modules: [
      { name: 'booking', enabled: true },
      { name: 'crm', enabled: true },
      { name: 'payments', enabled: true },
      { name: 'marketing', enabled: true },
      { name: 'analytics', enabled: true },
      { name: 'admin_security', enabled: true }
    ],
    assistant: {
      enabled: true,
      engines: ['predictive_scheduling', 'client_behavior']
    },
    logging: {
      level: 'info',
      format: 'simple'
    }
  });

  console.log('✅ Business Spine initialized successfully!\n');

  // Demo context
  const demoContext = {
    actor: {
      userId: 'demo-user',
      role: 'staff'
    },
    tenantId: 'demo-tenant',
    nowISO: new Date().toISOString(),
    timezone: 'America/New_York',
    channel: 'chat',
    // Extended context for smart engines
    practitioner: {
      id: 'staff-001',
      displayName: 'John Doe',
      timezone: 'America/New_York',
      role: 'staff'
    },
    clients: [
      {
        id: 'client-001',
        email: 'alice@example.com',
        lastBookingAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        totalBookings: 5,
        totalSpentCents: 75000,
        preferredServices: ['haircut', 'coloring']
      },
      {
        id: 'client-002',
        email: 'bob@example.com',
        lastBookingAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        totalBookings: 12,
        totalSpentCents: 120000,
        preferredServices: ['massage', 'facial']
      }
    ],
    bookings: [
      {
        id: 'booking-001',
        practitionerId: 'staff-001',
        serviceId: 'service-001',
        clientId: 'client-002',
        startAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        endAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
        status: 'BOOKED',
        pricePaidCents: 10000
      },
      {
        id: 'booking-002',
        practitionerId: 'staff-001',
        serviceId: 'service-002',
        clientId: 'client-003',
        startAt: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
        endAt: new Date(Date.now() + 6.5 * 60 * 60 * 1000), // 6.5 hours from now
        status: 'BOOKED',
        pricePaidCents: 15000
      }
    ],
    services: [
      {
        id: 'service-001',
        practitionerId: 'staff-001',
        title: 'Haircut and Style',
        type: 'LIVE',
        basePriceCents: 10000,
        durationMin: 60
      },
      {
        id: 'service-002',
        practitionerId: 'staff-001',
        title: 'Massage Therapy',
        type: 'LIVE',
        basePriceCents: 15000,
        durationMin: 90
      }
    ]
  };

  // Demo 1: Intent Detection
  console.log('🔍 Demo 1: Intent Detection');
  console.log('Input: "Schedule a haircut for tomorrow at 2pm"');
  
  const intents = spine.detectIntents('Schedule a haircut for tomorrow at 2pm', demoContext);
  console.log('Detected intents:', intents);
  console.log('');

  // Demo 2: Smart Suggestions
  console.log('🤖 Demo 2: Smart Assistant Suggestions');
  const suggestions = await spine.getSmartSuggestions(demoContext);
  console.log(`Found ${suggestions.length} smart suggestions:`);
  suggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. [${suggestion.severity.toUpperCase()}] ${suggestion.title}`);
    console.log(`   ${suggestion.message}`);
    if (suggestion.actions && suggestion.actions.length > 0) {
      console.log(`   Actions: ${suggestion.actions.map(a => a.label).join(', ')}`);
    }
    console.log('');
  });

  // Demo 3: Request Processing
  console.log('💬 Demo 3: Request Processing');
  console.log('Input: "Show my schedule for today"');
  
  const result = await spine.processRequest('Show my schedule for today', demoContext);
  console.log('Response:', result.final?.message || 'No response');
  console.log(`Steps executed: ${result.steps.length}`);
  console.log('');

  // Demo 4: System Information
  console.log('📊 Demo 4: System Information');
  const spines = spine.getSpines();
  const engines = spine.getEngines();
  const plugins = spine.getPlugins();
  
  console.log(`Loaded ${spines.length} business spines:`);
  spines.forEach(spine => {
    console.log(`  - ${spine.name} v${spine.version}: ${spine.description}`);
  });
  
  console.log(`\nLoaded ${engines.length} smart engines:`);
  engines.forEach(engine => {
    console.log(`  - ${engine.name} v${engine.version}`);
  });
  
  console.log(`\nLoaded ${plugins.length} plugins:`);
  plugins.forEach(plugin => {
    console.log(`  - ${plugin.name} v${plugin.version}: ${plugin.description}`);
  });

  console.log('\n✨ Demo completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Start the API server: npm start');
  console.log('2. Visit http://localhost:3000/health');
  console.log('3. Try the API endpoints with curl or Postman');
  console.log('4. Add custom plugins to extend functionality');

  // Cleanup
  await spine.shutdown();
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the demo
runDemo().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});
