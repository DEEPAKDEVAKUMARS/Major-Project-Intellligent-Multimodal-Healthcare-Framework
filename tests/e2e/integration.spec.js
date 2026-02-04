import { test, expect } from '@playwright/test'

test.describe('Mindmate AI Integration Tests', () => {
  
  test.describe('Complete User Registration Flow', () => {
    test('should complete full registration and login flow', async ({ page }) => {
      // Step 1: Navigate to signup
      await page.goto('/signup')
      
      // Step 2: Fill registration form
      await page.fill('input[placeholder="Full Name"]', 'Integration Test User')
      await page.fill('input[placeholder="Aadhar Number"]', '999999999999')
      await page.fill('input[placeholder="Phone Number"]', '9876543210')
      await page.fill('input[placeholder="Address"]', '123 Integration Test St')
      await page.fill('input[placeholder="Family Members"]', '3')
      await page.fill('input[placeholder="Password"]', 'testpassword123')
      
      // Step 3: Submit registration
      await page.click('button:has-text("Sign Up")')
      
      // Step 4: Should show success message and redirect to login
      await expect(page.locator('text=Registration successful')).toBeVisible()
      
      // Step 5: Navigate to login
      await page.goto('/login')
      
      // Step 6: Fill login form
      await page.fill('input[placeholder="Aadhar Number"]', '999999999999')
      await page.fill('input[placeholder="Password"]', 'testpassword123')
      
      // Step 7: Submit login
      await page.click('button:has-text("Login")')
      
      // Step 8: Should redirect to homepage
      await expect(page).toHaveURL(/.*homepage/)
      await expect(page.locator('text=Welcome, Integration Test User')).toBeVisible()
    })
  })

  test.describe('Complete Shopping Cart Flow', () => {
    test('should complete full shopping cart workflow', async ({ page }) => {
      // Mock user authentication
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      // Step 1: Navigate to menu
      await page.goto('/menuforcitizens')
      
      // Step 2: Add items to cart (if available)
      const addToCartButtons = await page.locator('button:has-text("Add to Cart")').count()
      if (addToCartButtons > 0) {
        await page.click('button:has-text("Add to Cart") >> nth=0')
        
        // Step 3: Navigate to cart
        await page.goto('/cartproduct/1')
        
        // Step 4: Verify cart items
        await expect(page.locator('text=Your Cart')).toBeVisible()
        
        // Step 5: Proceed to checkout
        const checkoutButton = page.locator('button:has-text("Proceed to Checkout")')
        if (await checkoutButton.count() > 0) {
          await checkoutButton.click()
          
          // Step 6: Fill booking details
          await page.fill('input[placeholder="Name"]', 'Test User')
          await page.fill('input[placeholder="Address"]', '123 Test St')
          await page.fill('input[placeholder="Aadhar Number"]', '123456789012')
          
          // Step 7: Submit booking
          const submitButton = page.locator('button:has-text("Place Order")')
          if (await submitButton.count() > 0) {
            await submitButton.click()
            
            // Step 8: Verify order confirmation
            await expect(page.locator('text=Order Placed Successfully')).toBeVisible()
          }
        }
      }
    })
  })

  test.describe('Complete Appointment Booking Flow', () => {
    test('should complete appointment booking workflow', async ({ page }) => {
      // Mock user authentication
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      // Step 1: Navigate to homepage
      await page.goto('/homepage')
      
      // Step 2: Click on Psychiatrists Near You
      await page.click('button:has-text("Psychiatrists Near You")')
      
      // Step 3: Should navigate to appointment finder
      await expect(page).toHaveURL(/.*appointmentfinder/)
      
      // Step 4: Check if location permission is requested
      const locationPermission = await page.evaluate(() => {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false)
          )
        })
      })
      
      // Step 5: Verify appointment finder page loads
      await expect(page.locator('text=Find Psychiatrists')).toBeVisible()
    })
  })

  test.describe('Complete Chatbot Integration Flow', () => {
    test('should complete chatbot interaction workflow', async ({ page }) => {
      // Mock user authentication
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      // Step 1: Navigate to homepage
      await page.goto('/homepage')
      
      // Step 2: Click on Talk to AI Doctor
      await page.click('button:has-text("Talk to AI Doctor")')
      
      // Step 3: Should open chatbot in new window/tab
      const newPage = await page.waitForEvent('popup')
      
      // Step 4: Navigate to chatbot page
      await newPage.goto('/mindmate')
      
      // Step 5: Verify chatbot interface
      await expect(newPage.locator('text=Dr. MindMate')).toBeVisible()
      
      // Step 6: Send a test message
      const messageInput = newPage.locator('input[placeholder*="message"], textarea[placeholder*="message"]')
      if (await messageInput.count() > 0) {
        await messageInput.fill('Hello, I need help with my mental health')
        
        // Step 7: Send message
        const sendButton = newPage.locator('button:has-text("Send"), button[type="submit"]')
        if (await sendButton.count() > 0) {
          await sendButton.click()
          
          // Step 8: Wait for response
          await expect(newPage.locator('text=Hello')).toBeVisible({ timeout: 10000 })
        }
      }
      
      await newPage.close()
    })
  })

  test.describe('Cross-Browser Compatibility', () => {
    test('should work consistently across different browsers', async ({ page, browserName }) => {
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      // Test core functionality
      await expect(page.locator('text=GENNEURO ❤️')).toBeVisible()
      await expect(page.locator('text=Digital Healthcare Solutions')).toBeVisible()
      
      // Test navigation
      await page.click('button:has-text("Your Cart")')
      await expect(page).toHaveURL(/.*cartproduct\/1/)
      
      console.log(`Test completed successfully on ${browserName}`)
    })
  })

  test.describe('Error Recovery Flow', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/**', route => route.abort())
      
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      await page.goto('/homepage')
      
      // Should still load the page even with API failures
      await expect(page.locator('text=GENNEURO ❤️')).toBeVisible()
      
      // Test error handling in forms
      await page.goto('/login')
      await page.fill('input[placeholder="Aadhar Number"]', '123456789012')
      await page.fill('input[placeholder="Password"]', 'password123')
      await page.click('button:has-text("Login")')
      
      // Should show error message for failed API call
      await expect(page.locator('text=Login failed')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Data Persistence Flow', () => {
    test('should maintain user session across page refreshes', async ({ page }) => {
      // Step 1: Set user data
      await page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'Test User',
          user_type: 'citizen'
        }))
      })
      
      // Step 2: Navigate to homepage
      await page.goto('/homepage')
      await expect(page.locator('text=Welcome, Test User')).toBeVisible()
      
      // Step 3: Refresh page
      await page.reload()
      
      // Step 4: Verify user data persists
      await expect(page.locator('text=Welcome, Test User')).toBeVisible()
      
      // Step 5: Navigate to different page and back
      await page.goto('/cartproduct/1')
      await page.goto('/homepage')
      
      // Step 6: Verify user data still persists
      await expect(page.locator('text=Welcome, Test User')).toBeVisible()
    })
  })

  test.describe('Multi-User Flow', () => {
    test('should handle multiple user sessions', async ({ page, context }) => {
      // Create two browser contexts (simulating different users)
      const user1Context = await context.browser().newContext()
      const user2Context = await context.browser().newContext()
      
      const user1Page = await user1Context.newPage()
      const user2Page = await user2Context.newPage()
      
      // Set different user data for each context
      await user1Page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 1,
          name: 'User One',
          user_type: 'citizen'
        }))
      })
      
      await user2Page.evaluate(() => {
        localStorage.setItem('userData', JSON.stringify({
          user_id: 2,
          name: 'User Two',
          user_type: 'citizen'
        }))
      })
      
      // Test both users can access homepage independently
      await user1Page.goto('/homepage')
      await user2Page.goto('/homepage')
      
      await expect(user1Page.locator('text=Welcome, User One')).toBeVisible()
      await expect(user2Page.locator('text=Welcome, User Two')).toBeVisible()
      
      // Clean up
      await user1Context.close()
      await user2Context.close()
    })
  })
})
