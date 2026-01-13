// Test TypeScript implementations
import { 
  nextauth, 
  jose, 
  pino, 
  sentry, 
  openid, 
  opentelemetry 
} from './dist/index.js';

console.log('Testing TypeScript implementations...\n');

// Test NextAuth.js
try {
  const auth = nextauth.NextAuth({
    providers: [
      nextauth.providers.Google({ clientId: 'test', clientSecret: 'test' })
    ]
  });
  console.log('✅ NextAuth.js working:', !!auth);
} catch (error) {
  console.log('❌ NextAuth.js failed:', error.message);
}

// Test JOSE
try {
  const token = jose.SignJWT({ sub: 'user123' });
  console.log('✅ JOSE working:', !!token);
} catch (error) {
  console.log('❌ JOSE failed:', error.message);
}

// Test Pino
try {
  const logger = pino.pino({ level: 'info' });
  console.log('✅ Pino working:', !!logger);
} catch (error) {
  console.log('❌ Pino failed:', error.message);
}

// Test Sentry
try {
  sentry.init({ dsn: 'https://test@sentry.io/123' });
  console.log('✅ Sentry working:', true);
} catch (error) {
  console.log('❌ Sentry failed:', error.message);
}

// Test OpenID
try {
  const issuer = new openid.Issuer('https://accounts.google.com');
  console.log('✅ OpenID working:', !!issuer);
} catch (error) {
  console.log('❌ OpenID failed:', error.message);
}

// Test OpenTelemetry
try {
  const tracer = opentelemetry.api.getTracer('test');
  console.log('✅ OpenTelemetry working:', !!tracer);
} catch (error) {
  console.log('❌ OpenTelemetry failed:', error.message);
}

console.log('\n🎉 TypeScript implementations test complete!');
