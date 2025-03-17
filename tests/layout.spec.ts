import { test, expect } from '@playwright/test';

test.describe('RootLayout Component', () => {
    test('should display API status alert with correct status', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Escape the slash in `left-1/2`
        const alert = page.locator('.fixed.top-0.left-1\\/2');

        await expect(alert).toBeVisible();

        // Check if the API status is correctly displayed (for example, the status should be 'OK' or 'WARN')
        const alertTitle = alert.locator('.font-bold');
        await expect(alertTitle).toContainText('API Status: OK'); // Modify this to match the actual status text

        // Check for uptime and version information in the alert description
        const alertDescription = alert.locator('.text-gray-600');
        await expect(alertDescription).toContainText('Temps de fonctionnement de l\'API');
        await expect(alertDescription).toContainText('Version de l\'API');
    });

    test('should display correct version information', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Escape the slash in `left-1/2`
        const alert = page.locator('.fixed.top-0.left-1\\/2');

        // Check if the application version is shown correctly in the alert
        const alertDescription = alert.locator('.text-gray-600');
        await expect(alertDescription).toContainText('Version de l\'application');
    });
});
