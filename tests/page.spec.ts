import { test, expect } from '@playwright/test';

// Mocking the API function `searchReleverCapteur` and `transform` to simulate server-side behavior
test.describe('Page Component', () => {
    test('should display ViewToggle with transformed data', async ({ page, context }) => {
        // Mocking API response
        await context.route('**/api/releverCapteur', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ Results: [{ devEUI: '12345', value: '10' }] }), // Simulate a response from the API
            });
        });

        // Mocking transform function response
        await context.addInitScript(() => {
            window['transform'] = () => ({
                chartData: [{ label: 'Sensor 1', value: 10 }],
                chartConfig: {},
            });
        });

        // Navigate to the page containing the Page component
        await page.goto('http://localhost:3000');

        // Wait for the ViewToggle component to appear
        const viewToggle = page.locator('div[data-testid="view-toggle"]'); // Add a test id to your ViewToggle component for easier targeting
        await expect(viewToggle).toBeVisible();

        // Check if the chart data from the transformed API response is displayed
        await expect(viewToggle).toContainText('Sensor 1'); // Check if transformed data is used in ViewToggle
    });

    test('should display error message when data fetching or transformation fails', async ({ page, context }) => {
        // Simulate an error in data fetching or transformation
        await context.route('**/api/releverCapteur', (route) => {
            route.abort(); // Simulate API failure
        });

        // Navigate to the page containing the Page component
        await page.goto('http://localhost:3000');

        // Wait for the error message to appear
        const errorMessage = page.locator('div.bg-red-100');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('Erreur lors du chargement des données');
    });
});
