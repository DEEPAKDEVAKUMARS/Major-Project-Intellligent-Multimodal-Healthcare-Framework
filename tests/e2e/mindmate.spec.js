import { test, expect } from '@playwright/test'

test.describe('Mindmate AI E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage before each test
    await page.goto('/')
  })

  test.describe('Authentication Flow', () => {
    test('should navigate to login page and display login form', async ({ page }) => {
      await page.goto('/login')
      
      await expect(page).toHaveTitle(/Login/)
      await expect(page.locator('input[placeholder="Aadhar Number"]')).toBeVisible()
      await expect(page.locator('input[placeholder="Password"]')).toBeVisible()
      await expect(page.locator('button:has-text("Login")')).toBeVisible()
    })

    test('should navigate to signup page and display signup form', async ({ page }) => {
      await page.goto('/signup')
      
      await expect(page).toHaveTitle(/Sign Up/)
      await expect(page.locator('input[placeholder="Full Name"]')).toBeVisible()
      await expect(page.locator('input[placeholder="Aadhar Number"]')).toBeVisible()
      await expect(page.locator('input[placeholder="Phone Number"]')).toBeVisible()
      await expect(page.locator('input[placeholder="Address"]')).toBeVisible()
      await expect(page.locator('input[placeholder="Family Members"]')).toBeVisible()
      await expect(page.locator('input[placeholder="Password"]')).toBeVisible()
    })

    test('should show validation errors for empty login form', async ({ page }) => {
      await page.goto('/login')
      
      await page.click('button:has-text("Login")')
      
      await expect(page.locator('text=Please fill in all fields')).toBeVisible()
    })

    test('should show validation errors for empty signup form', async ({ page }) => {
      await page.goto('/signup')
      
      await page.click('button:has-text("Sign Up")')
      
      await expect(page.locator('text=Please fill in all fields')).toBeVisible()
    })

    test('should navigate between login and signup pages', async ({ page }) => {
      await page.goto('/login')
      
      await page.click('text=Don\'t have an account? Sign up')
      await expect(page).toHaveURL(/.*signup/)
      
      await page.click('text=Already have an account? Login')
      await expect(page).toHaveURL(/.*login/)
    })
  })

  test.describe('Homepage Features', () => {
    test('should display homepage with all sections', async ({ page }) => {
      // Mock user data in localStorage
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      await expect(page.locator('text=GENNEURO ❤️')).toBeVisible()
      await expect(page.locator('text=Digital Healthcare Solutions')).toBeVisible()
      await expect(page.locator('text=Why Choose Us?')).toBeVisible()
      await expect(page.locator('text=Welcome, Test User')).toBeVisible()
    })

    test('should display service buttons when logged in', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      await expect(page.locator('button:has-text("Talk to AI Doctor")')).toBeVisible()
      await expect(page.locator('button:has-text("Psychiatrists Near You")')).toBeVisible()
      await expect(page.locator('button:has-text("Ophthalmologists Near You")')).toBeVisible()
      await expect(page.locator('button:has-text("Diabetic Detection")')).toBeVisible()
    })

    test('should handle logout functionality', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      await page.click('button:has-text("Logout")')
      
      // Should redirect to login page
      await expect(page).toHaveURL(/.*login/)
      
      // localStorage should be cleared
      const userData = await page.evaluate(() => localStorage.getItem('userData'))
      expect(userData).toBeNull()
    })
  })

  test.describe('Navigation Tests', () => {
    test('should navigate to cart page', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      await page.click('button:has-text("Your Cart")')
      
      await expect(page).toHaveURL(/.*cartproduct\/1/)
    })

    test('should navigate to orders page', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      await page.click('button:has-text("Your Orders")')
      
      await expect(page).toHaveURL(/.*citizenorderpage\/1/)
    })

    test('should navigate to appointment finder', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      await page.click('button:has-text("Psychiatrists Near You")')
      
      await expect(page).toHaveURL(/.*appointmentfinder/)
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      await expect(page.locator('text=GENNEURO ❤️')).toBeVisible()
      
      // Check if navbar toggle button is visible on mobile
      await expect(page.locator('.navbar-toggler')).toBeVisible()
    })

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      await expect(page.locator('text=GENNEURO ❤️')).toBeVisible()
      await expect(page.locator('text=Why Choose Us?')).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      const response = await page.goto('/nonexistent-page')
      expect(response?.status()).toBe(404)
    })

    test('should redirect to login when accessing protected routes without auth', async ({ page }) => {
      await page.goto('/homepage')
      
      // Should redirect to login since no user data
      await expect(page).toHaveURL(/.*login/)
    })
  })

  test.describe('Performance Tests', () => {
    test('should load homepage within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      await expect(page.locator('text=GENNEURO ❤️')).toBeVisible()
      
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    })
  })

  test.describe('Accessibility Tests', () => {
    test('should have proper heading structure', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      // Check for proper heading hierarchy
      const h1Elements = await page.locator('h1').count()
      expect(h1Elements).toBeGreaterThan(0)
      
      // Check for alt text on images
      const images = await page.locator('img').all()
      for (const img of images) {
        const alt = await img.getAttribute('alt')
        expect(alt).toBeTruthy()
      }
    })

    test('should be keyboard navigable', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      // Test tab navigation
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Check if focus is visible
      const focusedElement = await page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })
  })
})
