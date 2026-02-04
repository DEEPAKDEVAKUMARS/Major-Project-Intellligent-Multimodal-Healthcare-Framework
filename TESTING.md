# Mindmate AI Testing Documentation

## Overview
This document provides comprehensive testing documentation for the Mindmate AI healthcare platform. The testing suite covers frontend React components, backend Node.js APIs, Python Flask chatbot, and end-to-end user flows.

## Testing Stack

### Frontend Testing
- **Framework**: Vitest + React Testing Library
- **Environment**: jsdom
- **Coverage**: V8 provider
- **UI Testing**: Playwright

### Backend Testing
- **Framework**: Jest + Supertest
- **Database**: SQLite (test database)
- **API Testing**: HTTP endpoint testing

### Python Flask Testing
- **Framework**: pytest
- **Mocking**: unittest.mock
- **API Testing**: Flask test client

### End-to-End Testing
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Features**: Cross-browser, mobile, accessibility

## Test Structure

```
├── src/test/                    # Frontend unit tests
│   ├── setup.js                 # Test setup and mocks
│   ├── Homepage.test.jsx        # Homepage component tests
│   ├── Login.test.jsx           # Login component tests
│   └── Signup.test.jsx          # Signup component tests
├── backend/test/                # Backend API tests
│   └── api.test.js              # API endpoint tests
├── tests/e2e/                   # End-to-end tests
│   ├── mindmate.spec.js         # Main E2E tests
│   └── integration.spec.js      # Integration tests
├── test_chatbot.py              # Python Flask tests
├── vitest.config.js             # Vitest configuration
├── jest.config.js               # Jest configuration
└── playwright.config.js         # Playwright configuration
```

## Running Tests

### Install Dependencies
```bash
npm install
```

### Frontend Tests
```bash
# Run all frontend tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test Homepage.test.jsx
```

### Backend Tests
```bash
# Run backend API tests
npm run test:backend

# Run with coverage
npm run test:backend -- --coverage
```

### Python Flask Tests
```bash
# Install Python dependencies
pip install pytest flask-testing

# Run Flask tests
python -m pytest test_chatbot.py -v
```

### End-to-End Tests
```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run specific test file
npx playwright test mindmate.spec.js

# Run with UI mode
npx playwright test --ui
```

### All Tests
```bash
# Run all test suites
npm run test:all
```

## Test Categories

### 1. Unit Tests (Frontend)
- **Components**: Homepage, Login, Signup
- **Functionality**: Rendering, user interactions, form validation
- **Mocking**: localStorage, navigation, API calls

### 2. API Tests (Backend)
- **Authentication**: Signup, login, validation
- **Cart Management**: Add/remove items, calculations
- **Order Processing**: Booking creation, status updates
- **Stock Management**: CRUD operations

### 3. Flask API Tests (Python)
- **Chatbot**: Message processing, language detection
- **Context Handling**: Conversation history
- **Error Handling**: API failures, validation
- **Utility Functions**: Tamil text processing

### 4. Integration Tests
- **User Flows**: Complete registration to service usage
- **Shopping Cart**: End-to-end purchase flow
- **Appointment Booking**: Location-based doctor finding
- **Chatbot Integration**: AI interaction workflow

### 5. End-to-End Tests
- **Authentication Flow**: Login/signup processes
- **Navigation**: Page transitions and routing
- **Responsive Design**: Mobile, tablet, desktop
- **Error Handling**: Network failures, 404 pages
- **Performance**: Load times, accessibility
- **Cross-Browser**: Compatibility testing

## Test Data Management

### Frontend Tests
- Mock localStorage for user data
- Mock API responses
- Mock navigation functions
- Mock external services (geolocation, etc.)

### Backend Tests
- Test database setup/teardown
- Sample user data
- Mock external API calls
- Transaction rollback for data integrity

### Python Tests
- Temporary data directories
- Mock OpenAI API calls
- Test conversation files
- Language detection testing

## Coverage Reports

### Frontend Coverage
- Component rendering
- User interactions
- Error handling
- Navigation flows

### Backend Coverage
- API endpoints
- Database operations
- Validation logic
- Error responses

### Python Coverage
- API routes
- Utility functions
- Language processing
- Context management

## Continuous Integration

### GitHub Actions (Recommended)
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:coverage
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:backend
  python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v3
      - run: pip install -r requirements.txt
      - run: python -m pytest test_chatbot.py
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install
      - run: npm run test:e2e
```

## Best Practices

### Test Writing
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: One test per functionality
4. **Mock External Dependencies**: Isolate units under test
5. **Test Edge Cases**: Include error scenarios

### Test Maintenance
1. **Keep Tests Updated**: Update tests with code changes
2. **Remove Obsolete Tests**: Clean up unused tests
3. **Monitor Coverage**: Maintain good coverage metrics
4. **Performance**: Keep tests fast and reliable
5. **Documentation**: Document complex test scenarios

### Debugging Tests
1. **Use Debug Mode**: Run tests in debug mode
2. **Console Logs**: Add strategic console.log statements
3. **Test Isolation**: Ensure tests don't interfere with each other
4. **Mock Verification**: Verify mock calls and parameters
5. **Error Messages**: Use descriptive error messages

## Troubleshooting

### Common Issues

#### Frontend Tests
- **Mock Issues**: Ensure all external dependencies are mocked
- **Async Operations**: Use waitFor for async operations
- **Router Issues**: Wrap components with BrowserRouter
- **localStorage**: Mock localStorage in test setup

#### Backend Tests
- **Database**: Ensure test database is properly set up
- **Port Conflicts**: Use different ports for test servers
- **Async Operations**: Use async/await properly
- **Cleanup**: Clean up test data after each test

#### Python Tests
- **Import Issues**: Ensure proper module imports
- **Mock Setup**: Set up mocks before running tests
- **File Paths**: Use absolute paths for test files
- **Environment**: Set proper test environment variables

#### E2E Tests
- **Timing Issues**: Use proper waits and timeouts
- **Browser Issues**: Ensure browsers are installed
- **Network Issues**: Mock external API calls
- **Data Cleanup**: Clean up test data between runs

## Performance Testing

### Load Testing
- **API Endpoints**: Test with multiple concurrent requests
- **Database**: Test with large datasets
- **Frontend**: Test with slow networks
- **Chatbot**: Test with multiple concurrent users

### Stress Testing
- **Memory Usage**: Monitor memory consumption
- **CPU Usage**: Test under high CPU load
- **Network**: Test with poor network conditions
- **Concurrent Users**: Test with multiple users

## Security Testing

### Authentication
- **Password Validation**: Test password requirements
- **Session Management**: Test session timeouts
- **Authorization**: Test access controls
- **Input Validation**: Test for injection attacks

### API Security
- **Rate Limiting**: Test API rate limits
- **CORS**: Test cross-origin requests
- **Data Validation**: Test input sanitization
- **Error Handling**: Test information disclosure

## Monitoring and Reporting

### Test Metrics
- **Coverage Percentage**: Track code coverage
- **Test Duration**: Monitor test execution time
- **Pass/Fail Rate**: Track test reliability
- **Flaky Tests**: Identify unstable tests

### Reporting Tools
- **Coverage Reports**: HTML coverage reports
- **Test Results**: Detailed test result reports
- **Performance Metrics**: Load and performance data
- **Trend Analysis**: Track improvements over time

## Conclusion

This comprehensive testing suite ensures the reliability, performance, and security of the Mindmate AI platform. Regular testing helps maintain code quality and prevents regressions as the application evolves.

For questions or issues with the testing setup, please refer to the troubleshooting section or contact the development team.
