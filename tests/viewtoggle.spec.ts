import { test, expect } from '@playwright/test';

test.describe('ViewToggle Component', () => {
  test('should render chart data when the "chart" tab is selected', async ({ page }) => {
    // Mock the chartData and other necessary props before loading the page
    await page.goto('http://localhost:3000'); // Replace with the actual URL

    // Wait for the chart tab to be selected and verify chart is visible
    const chartTab = page.locator('button:has-text("Graphique")'); // Adjust to match the chart tab
    await chartTab.click();

    // Check if the chart canvas is visible
    const chartCanvas = page.locator('div[data-testid="chart-canvas"]'); // Add test id to ChartCanvas for easier targeting
    await expect(chartCanvas).toBeVisible();
  });

  test('should display query form when the "query" tab is selected', async ({ page }) => {
    // Navigate to the page where ViewToggle is rendered
    await page.goto('http://localhost:3000'); // Replace with the actual URL

    // Wait for the query tab to be selected and verify query form is visible
    const queryTab = await page.locator('text=Requête'); // Adjust to match the query tab
    await queryTab.click();

    // Verify that the QueryForm is visible
    const queryForm = await page.locator('div[data-testid="query-form"]'); // Add test id to QueryForm for easier targeting
    await expect(queryForm).toBeVisible();
  });

  test('should display "No data found" message when chartData is empty', async ({ page }) => {
    // Mock empty chartData for testing
    await page.goto('http://localhost:3000'); // Replace with the actual URL

    // Simulate empty chartData by injecting it or modifying the props
    // This can be done using `context.addInitScript` or mocking API responses

    // Check if the "No data found" message is shown
    const noDataMessage = await page.locator('div.text-red-500'); // Adjust to match the "No data found" message
    await expect(noDataMessage).toBeVisible();
    await expect(noDataMessage).toContainText('Aucune données n\'a été trouver');
  });

  test('should switch between chart and query tabs correctly', async ({ page }) => {
    await page.goto('http://localhost:3000'); // Replace with the actual URL

    // Initially, the "chart" tab should be active
    const chartTab = await page.locator('button:has-text("Graphique")');
    await expect(chartTab).toHaveAttribute('data-state', 'active');

    // Click on the "query" tab and check if it's now active
    const queryTab = await page.locator('button:has-text("Requête")');
    await queryTab.click();

    // Verify that the "query" tab is now active
    await expect(queryTab).toHaveAttribute('data-state', 'active');

    // Verify that the chart tab is no longer active
    await expect(chartTab).not.toHaveAttribute('data-state', 'active');
  });
});
