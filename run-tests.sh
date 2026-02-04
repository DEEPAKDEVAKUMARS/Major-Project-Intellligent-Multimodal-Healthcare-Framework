#!/bin/bash

# Mindmate AI Test Runner Script
# This script runs all test suites for the Mindmate AI project

echo "🧪 Starting Mindmate AI Test Suite..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    print_error "Python is not installed. Please install Python first."
    exit 1
fi

# Install dependencies if needed
print_status "Installing dependencies..."
npm install

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install pytest flask-testing

# Install Playwright browsers
print_status "Installing Playwright browsers..."
npx playwright install

echo ""
echo "🚀 Running Test Suites..."
echo "========================"

# Run Frontend Tests
echo ""
print_status "Running Frontend Tests (Vitest + React Testing Library)..."
if npm run test:coverage; then
    print_success "Frontend tests passed!"
else
    print_error "Frontend tests failed!"
    exit 1
fi

# Run Backend Tests
echo ""
print_status "Running Backend Tests (Jest + Supertest)..."
if npm run test:backend; then
    print_success "Backend tests passed!"
else
    print_error "Backend tests failed!"
    exit 1
fi

# Run Python Flask Tests
echo ""
print_status "Running Python Flask Tests (pytest)..."
if python -m pytest test_chatbot.py -v; then
    print_success "Python Flask tests passed!"
else
    print_error "Python Flask tests failed!"
    exit 1
fi

# Run End-to-End Tests
echo ""
print_status "Running End-to-End Tests (Playwright)..."
if npm run test:e2e; then
    print_success "End-to-End tests passed!"
else
    print_error "End-to-End tests failed!"
    exit 1
fi

echo ""
echo "🎉 All Tests Completed Successfully!"
echo "=================================="
print_success "✅ Frontend Tests: PASSED"
print_success "✅ Backend Tests: PASSED"
print_success "✅ Python Flask Tests: PASSED"
print_success "✅ End-to-End Tests: PASSED"

echo ""
print_status "Test coverage reports are available in:"
print_status "- Frontend: coverage/index.html"
print_status "- Backend: coverage/backend/index.html"
print_status "- E2E: playwright-report/index.html"

echo ""
print_status "To run individual test suites:"
print_status "- Frontend: npm run test"
print_status "- Backend: npm run test:backend"
print_status "- Python: python -m pytest test_chatbot.py"
print_status "- E2E: npm run test:e2e"

echo ""
print_success "🎯 Testing complete! Your Mindmate AI application is ready for production."
