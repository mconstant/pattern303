# Pattern 303 - E2E Tests

End-to-end testing suite using Playwright for Pattern 303.

## Overview

Tests are organized into categories:
- **basic.spec.ts** - Page load, navigation, UI components
- **backend.spec.ts** - Verification service API tests

## Setup

```bash
cd tests
npm install
npx playwright install
```

## Running Tests

### Local Development

```bash
# Run all tests (will start dev server automatically)
npm test

# Run in headed mode (see browser)
npm run test:headed

# Run with UI mode (interactive)
npm run test:ui

# Run specific test file
npx playwright test e2e/basic.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Against Production

```bash
# Test production site
BASE_URL=https://p303.xyz npx playwright test

# Test production backend
BACKEND_URL=https://p303.xyz:3001 npx playwright test e2e/backend.spec.ts
```

## Test Reports

```bash
# View HTML report
npm run test:report

# Reports are saved to:
# - playwright-report/ (HTML report)
# - test-results/ (JSON, JUnit, screenshots, videos)
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `dev` branches
- Pull requests to `main`
- Manual trigger via GitHub Actions

### Non-Blocking Design

Tests are configured with `continue-on-error: true` which means:
- ✅ Tests run on every push/PR
- ✅ Results are captured and uploaded
- ❌ Test failures **do NOT** block deployment
- 📊 Results available in GitHub Actions artifacts

This allows AI agents and developers to review test results without breaking the deployment pipeline.

## Test Coverage

### Frontend Tests
- ✅ Page load and navigation
- ✅ About page content (demoscene, products, token info)
- ✅ Pattern editor UI elements
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Performance metrics
- ✅ Console error detection

### Backend Tests
- ✅ Health endpoint
- ✅ Verification endpoint
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS headers
- ✅ Response time

## Writing New Tests

### Basic Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Expected')).toBeVisible();
  });
});
```

### Testing Backend API

```typescript
test('should test API endpoint', async ({ request }) => {
  const response = await request.get('http://localhost:3001/health');
  expect(response.ok()).toBeTruthy();
  
  const data = await response.json();
  expect(data.status).toBe('ok');
});
```

### Best Practices

1. **Use semantic locators**: Prefer `text=Button` over CSS selectors
2. **Wait for elements**: Use `await expect().toBeVisible()` not `waitForTimeout`
3. **Test user flows**: Test complete scenarios, not just elements
4. **Keep tests independent**: Each test should work in isolation
5. **Use fixtures**: Share setup between tests
6. **Mock when needed**: Don't rely on external services

## Debugging Failed Tests

### View Trace
```bash
npx playwright show-trace test-results/traces/trace.zip
```

### Run in Debug Mode
```bash
npx playwright test --debug
```

### Screenshot on Failure
Screenshots are automatically captured on failure and saved to `test-results/`

## Configuration

Edit `playwright.config.ts` to customize:
- Base URL
- Timeout values
- Browser projects
- Reporter options
- Retry strategies

## Environment Variables

```bash
BASE_URL=http://localhost:5173    # Frontend URL
BACKEND_URL=http://localhost:3001 # Backend URL
CI=true                            # CI mode (more retries, stricter)
```

## GitHub Actions Integration

The workflow file `.github/workflows/playwright-tests.yml` provides:
- Automated test runs on push/PR
- Artifact uploads (reports, screenshots, videos)
- PR comments with test summaries
- Test result summaries in Actions UI

### Viewing Results

1. Go to GitHub Actions tab
2. Click on latest workflow run
3. Download artifacts:
   - `playwright-results` - Full test output
   - `playwright-report` - HTML report

### For AI Agents

Test results are available in machine-readable formats:
- `test-results/results.json` - Full test results
- `test-results/junit.xml` - JUnit format

AI agents can parse these files to:
- Identify failing tests
- Understand regression patterns
- Generate bug reports
- Suggest fixes

## Common Issues

### "Browser not found"
```bash
npx playwright install
```

### "Port already in use"
Kill the process using port 5173 or 3001:
```bash
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### "Timeout waiting for element"
Increase timeout in test:
```typescript
await expect(element).toBeVisible({ timeout: 10000 });
```

### Tests pass locally but fail in CI
- Check environment variables
- Verify build artifacts
- Review CI logs for differences

## Future Enhancements

- [ ] Add wallet adapter mocking for full mint flow tests
- [ ] Visual regression testing with Percy/Chromatic
- [ ] Load testing with k6 or Artillery
- [ ] Accessibility testing with axe-core
- [ ] API contract testing with Pact
- [ ] Mobile device testing with BrowserStack

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [GitHub Actions Integration](https://playwright.dev/docs/ci-intro)
