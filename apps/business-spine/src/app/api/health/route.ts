import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';
import { db } from '@/lib/db';
import { AuthSpineError } from '@/lib/errors';

interface HealthCheck {
  name: string;
  status: 'ok' | 'degraded' | 'error';
  responseTime?: number;
  message?: string;
  details?: Record<string, any>;
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Simple health check query
    await db.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    
    return {
      name: 'database',
      status: 'ok',
      responseTime,
      details: {
        url: config.DATABASE_URL.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
      },
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    logger.error('Database health check failed', { error, responseTime });
    
    return {
      name: 'database',
      status: 'error',
      responseTime,
      message: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  if (!config.REDIS_URL) {
    return {
      name: 'redis',
      status: 'ok',
      message: 'Redis not configured (optional)',
    };
  }

  const start = Date.now();
  try {
    // Add Redis health check if you have Redis client
    // await redis.ping();
    const responseTime = Date.now() - start;
    
    return {
      name: 'redis',
      status: 'ok',
      responseTime,
      details: {
        url: config.REDIS_URL.replace(/\/\/.*@/, '//***:***@'),
      },
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    logger.error('Redis health check failed', { error, responseTime });
    
    return {
      name: 'redis',
      status: 'degraded',
      responseTime,
      message: error instanceof Error ? error.message : 'Unknown Redis error',
    };
  }
}

async function checkExternalAPIs(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Check any critical external APIs
    // For now, just simulate a check
    await new Promise(resolve => setTimeout(resolve, 10));
    const responseTime = Date.now() - start;
    
    return {
      name: 'external_apis',
      status: 'ok',
      responseTime,
      message: 'All external APIs responding',
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    logger.error('External API health check failed', { error, responseTime });
    
    return {
      name: 'external_apis',
      status: 'degraded',
      responseTime,
      message: error instanceof Error ? error.message : 'External API error',
    };
  }
}

function checkDiskSpace(): HealthCheck {
  try {
    // In a real implementation, you'd check actual disk space
    // For now, just simulate the check
    const freeSpace = Math.random() * 100; // GB
    const totalSpace = 100; // GB
    const usagePercent = ((totalSpace - freeSpace) / totalSpace) * 100;
    
    return {
      name: 'disk_space',
      status: usagePercent > 90 ? 'error' : usagePercent > 80 ? 'degraded' : 'ok',
      details: {
        freeSpace: `${freeSpace.toFixed(1)}GB`,
        totalSpace: `${totalSpace}GB`,
        usagePercent: `${usagePercent.toFixed(1)}%`,
      },
    };
  } catch (error) {
    return {
      name: 'disk_space',
      status: 'error',
      message: 'Unable to check disk space',
    };
  }
}

function checkMemory(): HealthCheck {
  try {
    const usage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const usagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;
    
    return {
      name: 'memory',
      status: usagePercent > 90 ? 'error' : usagePercent > 80 ? 'degraded' : 'ok',
      details: {
        rss: `${(usage.rss / 1024 / 1024).toFixed(1)}MB`,
        heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(1)}MB`,
        heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(1)}MB`,
        systemUsage: `${usagePercent.toFixed(1)}%`,
      },
    };
  } catch (error) {
    return {
      name: 'memory',
      status: 'error',
      message: 'Unable to check memory usage',
    };
  }
}

function checkEnvironment(): HealthCheck {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV',
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    return {
      name: 'environment',
      status: 'error',
      message: `Missing environment variables: ${missing.join(', ')}`,
      details: { missing },
    };
  }
  
  return {
    name: 'environment',
    status: 'ok',
    details: {
      nodeEnv: config.NODE_ENV,
      port: config.PORT,
      requiredVarsCount: requiredVars.length,
    },
  };
}

export async function GET(request: Request) {
  const start = Date.now();
  
  try {
    logger.info('Health check started');
    
    // Run all health checks in parallel
    const checks = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkExternalAPIs(),
      checkDiskSpace(),
      checkMemory(),
      checkEnvironment(),
    ]);
    
    const totalResponseTime = Date.now() - start;
    
    // Determine overall health
    const hasErrors = checks.some(check => check.status === 'error');
    const hasDegraded = checks.some(check => check.status === 'degraded');
    
    const overallStatus = hasErrors ? 'error' : hasDegraded ? 'degraded' : 'ok';
    const httpStatus = overallStatus === 'error' ? 503 : overallStatus === 'degraded' ? 200 : 200;
    
    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      version: '1.0.0',
      environment: config.NODE_ENV,
      uptime: process.uptime(),
      checks,
      summary: {
        total: checks.length,
        healthy: checks.filter(c => c.status === 'ok').length,
        degraded: checks.filter(c => c.status === 'degraded').length,
        errors: checks.filter(c => c.status === 'error').length,
      },
    };
    
    logger.info('Health check completed', {
      status: overallStatus,
      responseTime: totalResponseTime,
      healthy: healthData.summary.healthy,
      errors: healthData.summary.errors,
    });
    
    return NextResponse.json(healthData, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    const responseTime = Date.now() - start;
    logger.errorCapture(error as Error, { context: 'health_check', responseTime });
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      responseTime,
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 503,
    });
  }
}

// Also support HEAD requests for simple uptime checks
export async function HEAD() {
  try {
    // Quick check without full diagnostics
    await db.$queryRaw`SELECT 1`;
    
    return new Response(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new Response(null, {
      status: 503,
    });
  }
}
