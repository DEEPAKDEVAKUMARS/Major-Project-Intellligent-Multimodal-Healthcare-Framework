# Quick Testing Guide for Mindmate AI

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation
```bash
# Install all dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browsers
npx playwright install
```

## 🧪 Running Tests

### Option 1: Run All Tests (Recommended)
```bash
# On Linux/Mac
./run-tests.sh

# On Windows
run-tests.bat
```

### Option 2: Run Individual Test Suites
```bash
# Frontend Tests (React Components)
npm run test

# Backend Tests (Node.js API)
npm run test:backend

# Python Flask Tests (Chatbot API)
python -m pytest test_chatbot.py -v

# End-to-End Tests (Playwright)
npm run test:e2e
```

### Option 3: Run with Coverage
```bash
# Frontend with coverage
npm run test:coverage

# Backend with coverage
npm run test:backend -- --coverage
```

## 📊 Test Coverage

After running tests, coverage reports are available at:
- **Frontend**: `coverage/index.html`
- **Backend**: `coverage/backend/index.html`
- **E2E**: `playwright-report/index.html`

## 🔧 Test Configuration

### Frontend Tests (Vitest)
- Configuration: `vitest.config.js`
- Setup: `src/test/setup.js`
- Tests: `src/test/*.test.jsx`

### Backend Tests (Jest)
- Configuration: `jest.config.js`
- Tests: `backend/test/*.test.js`

### Python Tests (pytest)
- Tests: `test_chatbot.py`
- Dependencies: `requirements.txt`

### E2E Tests (Playwright)
- Configuration: `playwright.config.js`
- Tests: `tests/e2e/*.spec.js`

## 🐛 Troubleshooting

### Common Issues

#### Frontend Tests Fail
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run test
```

#### Backend Tests Fail
```bash
# Check if test database exists
ls backend/test-mindmate.db

# Recreate test database
rm backend/test-mindmate.db
npm run test:backend
```

#### Python Tests Fail
```bash
# Install missing dependencies
pip install pytest flask-testing

# Run with verbose output
python -m pytest test_chatbot.py -v -s
```

#### E2E Tests Fail
```bash
# Install browsers
npx playwright install

# Run with debug mode
npx playwright test --debug
```

## 📝 Writing New Tests

### Frontend Component Test
```javascript
// src/test/NewComponent.test.jsx
import { render, screen } from '@testing-library/react'
import NewComponent from '../Components/NewComponent'

test('renders component correctly', () => {
  render(<NewComponent />)
  expect(screen.getByText('Expected Text')).toBeInTheDocument()
})
```

### Backend API Test
```javascript
// backend/test/new-api.test.js
const request = require('supertest')
const app = require('../server')

test('GET /new-endpoint returns success', async () => {
  const response = await request(app)
    .get('/new-endpoint')
    .expect(200)
  
  expect(response.body.success).toBe(true)
})
```

### Python Flask Test
```python
# test_new_feature.py
import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_new_endpoint(client):
    response = client.get('/new-endpoint')
    assert response.status_code == 200
```

### E2E Test
```javascript
// tests/e2e/new-feature.spec.js
import { test, expect } from '@playwright/test'

test('new feature works correctly', async ({ page }) => {
  await page.goto('/new-page')
  await expect(page.locator('text=Expected Content')).toBeVisible()
})
```

## 🎯 Test Best Practices

1. **Write Tests First**: Follow TDD (Test-Driven Development)
2. **Test Edge Cases**: Include error scenarios and boundary conditions
3. **Mock External Dependencies**: Isolate units under test
4. **Use Descriptive Names**: Make test names clear and specific
5. **Keep Tests Fast**: Avoid slow operations in unit tests
6. **Maintain Test Data**: Use consistent test data across tests
7. **Clean Up**: Remove test data after each test
8. **Document Complex Tests**: Add comments for complex test scenarios

## 📈 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: actions/setup-python@v3
      - run: npm install
      - run: pip install -r requirements.txt
      - run: npx playwright install
      - run: ./run-tests.sh
```

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review the full testing documentation in `TESTING.md`
3. Check test logs for specific error messages
4. Ensure all dependencies are properly installed
5. Verify test configuration files are correct

## 🎉 Success!

When all tests pass, you'll see:
```
🎉 All Tests Completed Successfully!
==================================
✅ Frontend Tests: PASSED
✅ Backend Tests: PASSED
✅ Python Flask Tests: PASSED
✅ End-to-End Tests: PASSED
```

Your Mindmate AI application is ready for production! 🚀
