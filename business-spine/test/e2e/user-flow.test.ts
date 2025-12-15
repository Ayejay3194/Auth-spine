import { test, expect } from '@playwright/test';

/**
 * End-to-end tests for complete user flows
 */

test.describe('User Journey E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('homepage loads successfully', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Auth-Spine Platform/);

    // Verify main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Auth-Spine Platform');

    // Verify feature cards are visible
    const featureCards = page.locator('div').filter({ hasText: /Core Platform|Operations Spine|AI Assistant/ });
    await expect(featureCards.first()).toBeVisible();
  });

  test('dashboard navigation works', async ({ page }) => {
    // Click on Dashboard link
    await page.click('text=Dashboard');

    // Verify navigation
    await expect(page).toHaveURL(/dashboard/);

    // Verify dashboard content loads
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('API documentation is accessible', async ({ page }) => {
    // Click on API Documentation
    await page.click('text=API Documentation');

    // Verify Swagger UI loads
    await expect(page).toHaveURL(/swagger/);

    // Wait for Swagger UI to render
    const swagger = page.locator('#swagger-ui');
    await expect(swagger).toBeVisible({ timeout: 10000 });
  });

  test('operations panel is accessible', async ({ page }) => {
    // Navigate to operations panel
    await page.goto('http://localhost:3000/admin/auth-ops');

    // Verify page loads
    const panel = page.locator('main');
    await expect(panel).toBeVisible();
  });

  test('metrics endpoint returns data', async ({ page }) => {
    // Navigate to metrics
    const response = await page.goto('http://localhost:3000/api/metrics');

    // Verify response
    expect(response?.status()).toBe(200);

    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('text/plain');

    // Verify Prometheus format
    const body = await response?.text();
    expect(body).toContain('# HELP');
    expect(body).toContain('# TYPE');
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify homepage is responsive
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Verify feature grid stacks on mobile
    const featureCards = page.locator('div.grid');
    await expect(featureCards).toBeVisible();
  });

  test('quick links are functional', async ({ page }) => {
    // Test all quick links
    const links = [
      { text: 'Dashboard', url: /dashboard/ },
      { text: 'Operations Panel', url: /admin\/auth-ops/ },
    ];

    for (const link of links) {
      await page.goto('http://localhost:3000');
      await page.click(`text=${link.text}`);
      await expect(page).toHaveURL(link.url);
    }
  });
});

test.describe('Authentication Flow E2E', () => {
  test('login page should be accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/api/auth/login');

    // Verify endpoint exists
    const response = await page.waitForResponse(/auth\/login/);
    expect(response.status()).toBeLessThan(500); // Should not be server error
  });
});

test.describe('Performance Tests', () => {
  test('homepage loads within acceptable time', async ({ page }) => {
    const start = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - start;
    
    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('API requests respond quickly', async ({ page }) => {
    const start = Date.now();
    
    const response = await page.goto('http://localhost:3000/api/metrics');
    
    const responseTime = Date.now() - start;
    
    expect(response?.status()).toBe(200);
    // API should respond in less than 1 second
    expect(responseTime).toBeLessThan(1000);
  });
});

