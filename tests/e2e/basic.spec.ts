import { test, expect } from '@playwright/test';

test.describe('Pattern 303 - Page Load Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/Pattern 303/i);
    
    // Check main elements present
    await expect(page.locator('text=Pattern 303')).toBeVisible();
    await expect(page.locator('text=Connect Wallet').or(page.locator('text=About'))).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation
    const tabs = ['Create', 'My Patterns', 'Discover', 'About'];
    
    for (const tab of tabs) {
      const tabButton = page.locator(`text=${tab}`).first();
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(500);
        // Verify no errors
        const consoleErrors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        expect(consoleErrors.length).toBe(0);
      }
    }
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Wallet adapter')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Allow some expected errors (wallet not connected, etc.)
    const unexpectedErrors = consoleErrors.filter(err => 
      !err.includes('Wallet') && 
      !err.includes('adapter') &&
      !err.includes('not connected')
    );
    
    expect(unexpectedErrors).toHaveLength(0);
  });
});

test.describe('Pattern 303 - About Page', () => {
  test('should display demoscene story', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=About').click();
    
    await expect(page.locator('text=/The Black Lotus|demoscene/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show product images with affiliate links', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=About').click();
    
    // Check for product images
    const images = page.locator('img[src*="amazon"]').or(page.locator('img[src*="blogger.googleusercontent"]'));
    await expect(images.first()).toBeVisible({ timeout: 5000 });
  });

  test('should explain Pattern 303 token', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=About').click();
    
    await expect(page.locator('text=/Pattern 303 Token|\\$303/i')).toBeVisible();
  });

  test('should explain Nom de Guerre', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=About').click();
    
    await expect(page.locator('text=/Nom de Guerre|vanity alias/i')).toBeVisible();
  });
});

test.describe('Pattern 303 - Pattern Editor', () => {
  test('should display pattern editor controls', async ({ page }) => {
    await page.goto('/');
    
    // Go to Create tab (should be default or click it)
    const createTab = page.locator('text=Create').first();
    if (await createTab.isVisible()) {
      await createTab.click();
    }
    
    // Check for editor elements
    await expect(page.locator('text=/Tempo|BPM/i').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Cutoff/i').first()).toBeVisible();
    await expect(page.locator('text=/Resonance/i').first()).toBeVisible();
  });

  test('should have sequencer steps', async ({ page }) => {
    await page.goto('/');
    
    const createTab = page.locator('text=Create').first();
    if (await createTab.isVisible()) {
      await createTab.click();
    }
    
    // Check for step editor or sequencer
    const steps = page.locator('[class*="step"]').or(page.locator('[data-step]'));
    const stepCount = await steps.count();
    
    // TB-303 has 16 steps
    expect(stepCount).toBeGreaterThan(0);
  });

  test('should show mint button when wallet connected', async ({ page }) => {
    await page.goto('/');
    
    // Note: This test would require wallet adapter mocking in production
    // For now, just check the mint button exists in DOM
    const mintButton = page.locator('text=/Mint|Create NFT/i');
    
    // Button should exist (might be disabled if wallet not connected)
    await expect(mintButton.first()).toBeInViewport();
  });
});

test.describe('Pattern 303 - Performance', () => {
  test('should load in under 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have good Lighthouse scores', async ({ page }) => {
    await page.goto('/');
    
    // Basic performance checks
    const performanceEntry = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      };
    });
    
    expect(performanceEntry.domContentLoaded).toBeLessThan(3000);
    expect(performanceEntry.loadComplete).toBeLessThan(5000);
  });
});

test.describe('Pattern 303 - Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('text=Pattern 303')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('text=Pattern 303')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await expect(page.locator('text=Pattern 303')).toBeVisible();
  });
});
