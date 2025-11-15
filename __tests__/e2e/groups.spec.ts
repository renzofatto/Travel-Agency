import { test, expect } from '@playwright/test'

test.describe('Group Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
  })

  test('should complete full group creation flow', async ({ page }) => {
    // Start at home page
    await expect(page).toHaveTitle(/TravelHub/i)

    // Navigate to login (assuming authentication is required)
    await page.click('text=Login')
    await expect(page).toHaveURL(/.*login/)

    // Fill in login form (using test credentials)
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/)

    // Click create group button
    await page.click('text=/Create.*Group/i')
    await expect(page).toHaveURL(/.*groups\/new/)

    // Fill in group creation form
    await page.fill('input[name="name"]', 'E2E Test Trip to Tokyo')
    await page.fill('input[name="destination"]', 'Tokyo, Japan')
    await page.fill('textarea[name="description"]', 'An amazing trip to explore Tokyo and experience Japanese culture')
    await page.fill('input[name="start_date"]', '2024-09-01')
    await page.fill('input[name="end_date"]', '2024-09-10')

    // Submit the form
    await page.click('button:has-text("Create Group")')

    // Wait for redirect to group page
    await expect(page).toHaveURL(/.*groups\/[a-f0-9-]+$/)

    // Verify group details are displayed
    await expect(page.locator('text=E2E Test Trip to Tokyo')).toBeVisible()
    await expect(page.locator('text=Tokyo, Japan')).toBeVisible()
  })

  test('should show validation errors for invalid group data', async ({ page }) => {
    // Assuming we're already logged in (or navigate to login first)
    await page.goto('/dashboard/groups/new')

    // Try to submit without filling required fields
    await page.click('button:has-text("Create Group")')

    // Should show validation errors
    await expect(page.locator('text=/group name must be/i')).toBeVisible()
    await expect(page.locator('text=/destination must be/i')).toBeVisible()

    // Fill in name that's too short
    await page.fill('input[name="name"]', 'AB')
    await page.click('input[name="destination"]') // Trigger blur

    // Should show specific validation error
    await expect(page.locator('text=/at least 3 characters/i')).toBeVisible()
  })

  test('should navigate through group tabs', async ({ page }) => {
    // Assuming we have a test group created
    await page.goto('/groups/test-group-id')

    // Check all tabs are present
    await expect(page.locator('text=Overview')).toBeVisible()
    await expect(page.locator('text=Members')).toBeVisible()
    await expect(page.locator('text=Itinerary')).toBeVisible()
    await expect(page.locator('text=Expenses')).toBeVisible()
    await expect(page.locator('text=Documents')).toBeVisible()
    await expect(page.locator('text=Photos')).toBeVisible()

    // Navigate to Members tab
    await page.click('text=Members')
    await expect(page).toHaveURL(/.*members/)

    // Navigate to Itinerary tab
    await page.click('text=Itinerary')
    await expect(page).toHaveURL(/.*itinerary/)

    // Navigate to Expenses tab
    await page.click('text=Expenses')
    await expect(page).toHaveURL(/.*expenses/)
  })

  test('should add a member to the group', async ({ page }) => {
    // Navigate to group members page
    await page.goto('/groups/test-group-id/members')

    // Click add member button
    await page.click('text=/Add Member/i')

    // Fill in member email
    await page.fill('input[name="email"]', 'newmember@example.com')

    // Submit
    await page.click('button:has-text("Add Member")')

    // Verify success message
    await expect(page.locator('text=/added successfully/i')).toBeVisible({ timeout: 5000 })

    // Verify member appears in list
    await expect(page.locator('text=newmember@example.com')).toBeVisible()
  })

  test('should create an itinerary item', async ({ page }) => {
    // Navigate to itinerary page
    await page.goto('/groups/test-group-id/itinerary')

    // Click add activity button
    await page.click('text=/Add Activity/i')

    // Fill in activity details
    await page.fill('input[name="title"]', 'Visit Senso-ji Temple')
    await page.fill('textarea[name="description"]', 'Morning visit to the famous Buddhist temple')
    await page.fill('input[name="date"]', '2024-09-02')
    await page.fill('input[name="start_time"]', '09:00')
    await page.fill('input[name="end_time"]', '11:00')
    await page.fill('input[name="location"]', 'Senso-ji Temple, Asakusa')

    // Select category
    await page.click('button:has-text("Category")')
    await page.click('text=Activity')

    // Submit
    await page.click('button:has-text("Add Activity")')

    // Verify activity appears in itinerary
    await expect(page.locator('text=Visit Senso-ji Temple')).toBeVisible({ timeout: 5000 })
  })

  test('should create an expense and split it', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/groups/test-group-id/expenses')

    // Click add expense button
    await page.click('text=/Add Expense/i')

    // Fill in expense details
    await page.fill('input[name="description"]', 'Hotel Accommodation')
    await page.fill('input[name="amount"]', '300')

    // Select currency
    await page.click('button:has-text("Currency")')
    await page.click('text=USD')

    // Select category
    await page.click('button:has-text("Category")')
    await page.click('text=Accommodation')

    // Select split type
    await page.click('button:has-text("Split Type")')
    await page.click('text=Equal')

    // Submit
    await page.click('button:has-text("Add Expense")')

    // Verify expense appears in list
    await expect(page.locator('text=Hotel Accommodation')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=$300')).toBeVisible()
  })

  test('should upload a document', async ({ page }) => {
    // Navigate to documents page
    await page.goto('/groups/test-group-id/documents')

    // Click upload button
    await page.click('text=/Upload Document/i')

    // Fill in document details
    await page.fill('input[name="title"]', 'Flight Tickets')

    // Select document type
    await page.click('button:has-text("Document Type")')
    await page.click('text=Flight')

    // Upload file (create a test file)
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'tickets.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test file content'),
    })

    // Submit
    await page.click('button:has-text("Upload")')

    // Verify document appears in list
    await expect(page.locator('text=Flight Tickets')).toBeVisible({ timeout: 5000 })
  })

  test('should upload photos to gallery', async ({ page }) => {
    // Navigate to photos page
    await page.goto('/groups/test-group-id/photos')

    // Click upload button
    await page.click('text=/Upload Photos/i')

    // Upload multiple files
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles([
      {
        name: 'photo1.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('photo1 content'),
      },
      {
        name: 'photo2.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('photo2 content'),
      },
    ])

    // Add caption
    await page.fill('textarea[name="caption"]', 'Beautiful views of Tokyo')

    // Submit
    await page.click('button:has-text("Upload")')

    // Verify photos appear in gallery
    await expect(page.locator('img[alt*="photo"]').first()).toBeVisible({ timeout: 5000 })
  })

  test('should create and edit a note', async ({ page }) => {
    // Navigate to notes page
    await page.goto('/groups/test-group-id/notes')

    // Fill in note details
    await page.fill('input[name="title"]', 'Important Reminders')
    await page.fill('textarea[name="content"]', 'Remember to exchange currency before departure')

    // Submit
    await page.click('button:has-text("Save Note")')

    // Verify note appears
    await expect(page.locator('text=Important Reminders')).toBeVisible({ timeout: 5000 })

    // Edit the note
    await page.click('button:has-text("Edit")')
    await page.fill('textarea[name="content"]', 'Remember to exchange currency and pack adapter')
    await page.click('button:has-text("Save")')

    // Verify updated content
    await expect(page.locator('text=pack adapter')).toBeVisible({ timeout: 5000 })
  })

  test('should view balances and settlements', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/groups/test-group-id/expenses')

    // Click view balances
    await page.click('text=/View Balances/i')

    // Should show balance dashboard
    await expect(page).toHaveURL(/.*balances/)
    await expect(page.locator('text=/Balance/i')).toBeVisible()
    await expect(page.locator('text=/Settlement/i')).toBeVisible()
  })

  test('should edit group settings (leader only)', async ({ page }) => {
    // Navigate to group page
    await page.goto('/groups/test-group-id')

    // Click settings tab
    await page.click('text=Settings')
    await expect(page).toHaveURL(/.*settings/)

    // Edit group name
    await page.fill('input[name="name"]', 'Updated Trip Name')

    // Save changes
    await page.click('button:has-text("Update Group")')

    // Verify success message
    await expect(page.locator('text=/updated successfully/i')).toBeVisible({ timeout: 5000 })
  })

  test('should show group in dashboard after creation', async ({ page }) => {
    // Create a group first
    await page.goto('/dashboard/groups/new')
    await page.fill('input[name="name"]', 'Dashboard Test Trip')
    await page.fill('input[name="destination"]', 'Seoul, Korea')
    await page.fill('input[name="start_date"]', '2024-10-01')
    await page.fill('input[name="end_date"]', '2024-10-07')
    await page.click('button:has-text("Create Group")')

    // Navigate back to dashboard
    await page.goto('/dashboard')

    // Verify group appears in dashboard
    await expect(page.locator('text=Dashboard Test Trip')).toBeVisible()
    await expect(page.locator('text=Seoul, Korea')).toBeVisible()
  })
})
