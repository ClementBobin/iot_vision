import { test, expect } from '@playwright/test';

test.describe('QueryForm Tests', () => {
    test('should fill in the form and submit it', async ({ page }) => {
        // Navigate to the page containing the QueryForm component
        await page.goto('http://localhost:3000');  // Adjust URL if necessary

        // Fill in the fields
        await page.fill('input[name="NameQuery"]', 'Test Query');
        await page.fill('input[name="DescriptionQuery"]', 'Test Description');
        await page.fill('input[name="IntervaleQueryMinutes"]', '30');
        await page.fill('input[name="IdSite"]', '123e4567-e89b-12d3-a456-426614174000');  // Example UUID

        // Fill other optional fields
        await page.fill('input[name="SiteName"]', 'Site A');
        await page.fill('input[name="CapteurName"]', 'Sensor 1');
        await page.fill('input[name="CapteurTypeName"]', 'Type A');
        await page.fill('input[name="Module"]', 'Module 1');
        await page.fill('input[name="Type"]', 'Type X');
        await page.fill('input[name="Model"]', 'Model 1');

        // Select a date range
        await page.click('button:has-text("Sélectionnez une plage de dates")'); // Open date range picker
        await page.click('span[aria-label="2025 February 1"]'); // Select start date
        await page.click('span[aria-label="2025 February 10"]'); // Select end date

        // Submit the form
        await page.click('button[type="submit"]:has-text("Soumettre")');

        // Wait for the alert dialog to appear
        await page.waitForSelector('text=Votre JSON a été copié dans le presse-papiers');

        // Verify the alert dialog content
        const alertDialog = await page.locator('text=Votre JSON a été copié dans le presse-papiers');
        await expect(alertDialog).toBeVisible();

        // Verify the JSON content (make sure it matches expected values)
        const jsonText = await page.locator('textarea').innerText();
        expect(jsonText).toContain('"NameQuery": "Test Query"');
        expect(jsonText).toContain('"DescriptionQuery": "Test Description"');
        expect(jsonText).toContain('"IntervaleQueryMinutes": 30');
        expect(jsonText).toContain('"IdSite": "123e4567-e89b-12d3-a456-426614174000"');

        // Optionally, verify that the clipboard contains the correct JSON
        // Note: This may require some additional configuration depending on your setup
        // Example: Check clipboard content via a mock API or use Playwright's clipboard APIs if supported

        // Close the alert dialog
        await page.click('button:has-text("Continuer")');
    });
});
