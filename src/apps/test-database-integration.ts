import { DatabasePlatformOrchestrator, DEFAULT_VERTICALS } from '../../../packages/enterprise/platform/index.js';
import { prisma } from '../src/lib/prisma-fallback.js';

// Use fallback Prisma client to avoid dependency issues
const prismaClient = prisma;

async function testDatabaseIntegration() {
  console.log('🚀 Testing Database Platform Integration...\n');

  try {
    // Initialize the database platform
    const platform = new DatabasePlatformOrchestrator(prismaClient);
    await platform.initialize();

    // Load default vertical configurations
    Object.values(DEFAULT_VERTICALS).forEach(config => {
      platform.loadVerticalConfig(config);
    });

    console.log('✅ Platform initialized successfully');

    // Test client creation
    console.log('\n📝 Testing Client Management...');
    const client = await platform.createClient({
      email: 'test@example.com',
      name: 'Test Client',
      phone: '555-0123',
      preferences: { preferredTime: 'morning' },
      metadata: { source: 'test' }
    });
    console.log(`✅ Created client: ${client.name} (${client.email})`);

    // Test professional creation
    console.log('\n👨‍💼 Testing Professional Management...');
    const professional = await platform.createProfessional({
      email: 'pro@example.com',
      name: 'Test Professional',
      vertical: 'beauty',
      bio: 'Expert hairstylist with 10 years experience',
      metadata: { license: 'ABC123' }
    });
    console.log(`✅ Created professional: ${professional.name} (${professional.vertical})`);

    // Test service creation
    console.log('\n💅 Testing Service Management...');
    const service = await platform.createService({
      professionalId: professional.id,
      name: 'Premium Haircut',
      durationMin: 60,
      price: { currency: 'USD', amountCents: 7500 },
      locationType: 'in_person',
      recurrence: 'one_time',
      metadata: { category: 'hair', level: 'premium' }
    });
    console.log(`✅ Created service: ${service.name} ($${service.price.amountCents / 100})`);

    // Test booking creation
    console.log('\n📅 Testing Booking Management...');
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 24); // Tomorrow
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 60);

    const booking = await platform.createBooking({
      clientId: client.id,
      professionalId: professional.id,
      serviceId: service.id,
      startAtUtc: startTime.toISOString(),
      endAtUtc: endTime.toISOString()
    });
    console.log(`✅ Created booking: ${booking.id.slice(-8)} (${booking.status})`);

    // Test booking confirmation
    console.log('\n✅ Testing Booking Confirmation...');
    const confirmedBooking = await platform.confirmBooking(booking.id);
    console.log(`✅ Confirmed booking: ${confirmedBooking.status}`);

    // Test analytics tracking
    console.log('\n📊 Testing Analytics...');
    await platform.trackCustomEvent('test.integration', {
      clientId: client.id,
      professionalId: professional.id,
      bookingId: booking.id
    }, client.id);
    console.log('✅ Tracked custom analytics event');

    // Test analytics reporting
    const analytics = await platform.getAnalytics();
    console.log(`✅ Generated analytics report: ${analytics.totalEvents} events tracked`);

    // Test system status
    console.log('\n🏥 Testing System Status...');
    const status = await platform.getSystemStatus();
    console.log(`✅ System status: ${status.storage} storage, ${status.stats.clients} clients, ${status.stats.bookings} bookings`);

    // Test data export
    console.log('\n💾 Testing Data Export...');
    const exportData = await platform.exportData();
    console.log(`✅ Exported data: ${exportData.clients.length} clients, ${exportData.professionals.length} professionals`);

    // Test search functionality
    console.log('\n🔍 Testing Search...');
    const searchResults = await platform.searchClients('test');
    console.log(`✅ Search results: ${searchResults.length} clients found`);

    console.log('\n🎉 All database integration tests passed!');
    console.log('\n📈 Summary:');
    console.log(`   - Clients: ${status.stats.clients}`);
    console.log(`   - Professionals: ${status.stats.professionals}`);
    console.log(`   - Services: ${status.stats.services}`);
    console.log(`   - Bookings: ${status.stats.bookings}`);
    console.log(`   - Analytics Events: ${status.database?.totalEvents || 0}`);
    console.log(`   - Active Users: ${status.database?.activeUsers || 0}`);
    console.log(`   - Conversion Rate: ${status.database?.conversionRate || 0}%`);

  } catch (error) {
    console.error('❌ Database integration test failed:', error);
    throw error;
  } finally {
    // Only disconnect if using real Prisma client
    if (prismaClient && typeof prismaClient.$disconnect === 'function') {
      await prismaClient.$disconnect();
    }
  }
}

// Run the test if called directly
if (require.main === module) {
  testDatabaseIntegration()
    .then(() => {
      console.log('\n✅ Database integration test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database integration test failed:', error);
      process.exit(1);
    });
}

export { testDatabaseIntegration };
