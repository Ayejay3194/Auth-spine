import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and local storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('user can navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Check if we can see the login/signup options
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
    
    // Navigate to login
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('user can register new account', async ({ page }) => {
    await page.goto('/login');
    
    // Click on Sign Up tab
    await page.click('text=Sign Up');
    
    // Fill out registration form
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.fill('input[name="name"]', 'Test User');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard or onboarding
    await expect(page).toHaveURL(/.*\/dashboard|.*\/onboarding/);
    
    // Check for success message or dashboard elements
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 });
  });

  test('user can login with valid credentials', async ({ page }) => {
    // First, create a test user or use existing test credentials
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Check for dashboard elements
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('login fails with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should stay on login page and show error
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('user can logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Find and click logout button
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Verify we're logged out by trying to access protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('protected routes require authentication', async ({ page }) => {
    // Try to access protected routes without being logged in
    const protectedRoutes = [
      '/dashboard',
      '/admin',
      '/settings',
      '/payroll',
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login/);
    }
  });

  test('theme toggle works correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Find theme toggle button
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeToggle).toBeVisible();
    
    // Check initial state (should be light by default)
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    
    // Toggle to dark mode
    await themeToggle.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Toggle back to light mode
    await themeToggle.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('responsive navigation works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Mobile navigation should be visible
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
    
    // Open mobile menu
    await page.click('button[aria-label="Open menu"]');
    await expect(page.locator('nav.mobile-menu')).toBeVisible();
    
    // Check navigation items
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Login')).toBeVisible();
    
    // Close mobile menu
    await page.click('button[aria-label="Close menu"]');
    await expect(page.locator('nav.mobile-menu')).not.toBeVisible();
  });

  test('form validation works correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
    
    // Test invalid email format
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email format')).toBeVisible();
    
    // Test password too short
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Password must be at least')).toBeVisible();
  });

  test('loading states work correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Fill form and submit
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Click submit and check for loading state
    await page.click('button[type="submit"]');
    
    // Should show loading indicator
    await expect(page.locator('.loading-spinner')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    
    // Wait for completion
    await expect(page).toHaveURL(/.*\/dashboard|.*\/login/, { timeout: 10000 });
  });
});
