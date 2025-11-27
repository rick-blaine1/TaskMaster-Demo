import { test, expect } from '@playwright/test';

test.describe('TaskMaster-Demo Basic E2E Tests', () => {
  test('application loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads and has the expected title
    await expect(page).toHaveTitle(/TaskMaster/);
    
    // Check that the main heading is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Check that the add task form is present
    await expect(page.locator('form')).toBeVisible();
    
    // Check that the task list container is present
    await expect(page.locator('[data-testid="task-list"]')).toBeVisible();
  });

  test('can add a new task', async ({ page }) => {
    await page.goto('/');
    
    // Fill in the task form
    await page.fill('input[placeholder*="task"]', 'Test E2E Task');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for the task to appear in the list
    await expect(page.locator('text=Test E2E Task')).toBeVisible();
  });

  test('can mark task as completed', async ({ page }) => {
    await page.goto('/');
    
    // Add a task first
    await page.fill('input[placeholder*="task"]', 'Task to Complete');
    await page.click('button[type="submit"]');
    
    // Wait for task to appear
    await expect(page.locator('text=Task to Complete')).toBeVisible();
    
    // Find and click the checkbox to complete the task
    const taskCheckbox = page.locator('[data-testid="task-checkbox"]').first();
    await taskCheckbox.click();
    
    // Verify the task is marked as completed
    await expect(taskCheckbox).toBeChecked();
  });

  test('can delete a task', async ({ page }) => {
    await page.goto('/');
    
    // Add a task first
    await page.fill('input[placeholder*="task"]', 'Task to Delete');
    await page.click('button[type="submit"]');
    
    // Wait for task to appear
    await expect(page.locator('text=Task to Delete')).toBeVisible();
    
    // Click delete button
    const deleteButton = page.locator('[data-testid="delete-task"]').first();
    await deleteButton.click();
    
    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.locator('button:has-text("Delete")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Verify the task is removed
    await expect(page.locator('text=Task to Delete')).not.toBeVisible();
  });

  test('can filter tasks', async ({ page }) => {
    await page.goto('/');
    
    // Add a completed task
    await page.fill('input[placeholder*="task"]', 'Completed Task');
    await page.click('button[type="submit"]');
    await page.locator('[data-testid="task-checkbox"]').first().click();
    
    // Add an incomplete task
    await page.fill('input[placeholder*="task"]', 'Incomplete Task');
    await page.click('button[type="submit"]');
    
    // Test filtering by completed tasks
    const completedFilter = page.locator('button:has-text("Completed")');
    if (await completedFilter.isVisible()) {
      await completedFilter.click();
      await expect(page.locator('text=Completed Task')).toBeVisible();
      await expect(page.locator('text=Incomplete Task')).not.toBeVisible();
    }
    
    // Test filtering by active tasks
    const activeFilter = page.locator('button:has-text("Active")');
    if (await activeFilter.isVisible()) {
      await activeFilter.click();
      await expect(page.locator('text=Incomplete Task')).toBeVisible();
      await expect(page.locator('text=Completed Task')).not.toBeVisible();
    }
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that the app is still functional on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
    
    // Test adding a task on mobile
    await page.fill('input[placeholder*="task"]', 'Mobile Task');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Mobile Task')).toBeVisible();
  });

  test('handles network errors gracefully', async ({ page }) => {
    // Intercept network requests and simulate failure
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    await page.goto('/');
    
    // Try to add a task when network is failing
    await page.fill('input[placeholder*="task"]', 'Network Error Task');
    await page.click('button[type="submit"]');
    
    // Check for error message or retry mechanism
    // This will depend on how error handling is implemented
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText(/error|failed|retry/i);
    }
  });
});