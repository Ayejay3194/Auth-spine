/**
 * Load Testing Script
 * Run with: tsx scripts/load-test.ts
 */

interface LoadTestConfig {
  baseUrl: string;
  duration: number; // seconds
  rps: number; // requests per second
  endpoints: string[];
}

interface TestResult {
  endpoint: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

async function loadTest(config: LoadTestConfig): Promise<TestResult[]> {
  const results: Map<string, number[]> = new Map();
  const errors: Map<string, number> = new Map();
  
  config.endpoints.forEach(endpoint => {
    results.set(endpoint, []);
    errors.set(endpoint, 0);
  });

  const startTime = Date.now();
  const endTime = startTime + (config.duration * 1000);
  const interval = 1000 / config.rps;

  console.log(`Starting load test...`);
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Duration: ${config.duration}s`);
  console.log(`Rate: ${config.rps} RPS`);
  console.log(`Endpoints: ${config.endpoints.length}`);
  console.log('---');

  const promises: Promise<void>[] = [];

  while (Date.now() < endTime) {
    for (const endpoint of config.endpoints) {
      const requestStart = Date.now();
      
      const promise = fetch(`${config.baseUrl}${endpoint}`)
        .then(res => {
          const duration = Date.now() - requestStart;
          if (res.ok) {
            results.get(endpoint)!.push(duration);
          } else {
            errors.set(endpoint, (errors.get(endpoint) || 0) + 1);
          }
        })
        .catch(() => {
          errors.set(endpoint, (errors.get(endpoint) || 0) + 1);
        });

      promises.push(promise);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  await Promise.all(promises);

  // Calculate results
  const testResults: TestResult[] = [];

  for (const endpoint of config.endpoints) {
    const times = results.get(endpoint)!.sort((a, b) => a - b);
    const errorCount = errors.get(endpoint) || 0;
    const totalRequests = times.length + errorCount;

    if (times.length > 0) {
      const sum = times.reduce((a, b) => a + b, 0);
      const avg = sum / times.length;
      const p95Index = Math.floor(times.length * 0.95);
      const p99Index = Math.floor(times.length * 0.99);

      testResults.push({
        endpoint,
        totalRequests,
        successCount: times.length,
        errorCount,
        avgResponseTime: Math.round(avg),
        minResponseTime: times[0],
        maxResponseTime: times[times.length - 1],
        p95ResponseTime: times[p95Index] || 0,
        p99ResponseTime: times[p99Index] || 0,
      });
    }
  }

  return testResults;
}

function printResults(results: TestResult[]) {
  console.log('\n=== Load Test Results ===\n');

  for (const result of results) {
    console.log(`Endpoint: ${result.endpoint}`);
    console.log(`  Total Requests: ${result.totalRequests}`);
    console.log(`  Success: ${result.successCount} (${((result.successCount / result.totalRequests) * 100).toFixed(2)}%)`);
    console.log(`  Errors: ${result.errorCount}`);
    console.log(`  Avg Response: ${result.avgResponseTime}ms`);
    console.log(`  Min Response: ${result.minResponseTime}ms`);
    console.log(`  Max Response: ${result.maxResponseTime}ms`);
    console.log(`  P95 Response: ${result.p95ResponseTime}ms`);
    console.log(`  P99 Response: ${result.p99ResponseTime}ms`);
    console.log('---');
  }
}

// Run test
const config: LoadTestConfig = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  duration: 60, // 1 minute
  rps: 10, // 10 requests per second
  endpoints: [
    '/api/providers',
    '/api/booking/slots',
    '/api/metrics',
    '/dashboard',
  ],
};

loadTest(config)
  .then(printResults)
  .catch(console.error);

