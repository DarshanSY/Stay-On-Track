import { test, expect } from '@playwright/test';

test.describe('StayOnTrack E2E', () => {
    test('Dashboard loads', async ({ page }) => {
        await page.goto('http://localhost:3000');
        // Wait for network idle or title
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveTitle(/StayOnTrack/);

        // Check for charts (canvas or svg)
        const charts = page.locator('canvas, svg');
        await expect(charts.first()).toBeVisible();

        await page.screenshot({ path: '../qa_artifacts/screens/dashboard.png' });
    });

    test('Predictions page', async ({ page }) => {
        await page.goto('http://localhost:3000/predictions');

        // Fill form
        await page.fill('input[name="attendance_percentage"]', '75'); // Adjust selectors as needed
        await page.fill('input[name="cgpa"]', '7.2');
        await page.fill('input[name="current_semester"]', '5');

        // Select model
        // Assuming a select or buttons. Code says "model selector exists".
        // I'll try to find a select or combobox
        const modelSelect = page.getByRole('combobox');
        if (await modelSelect.isVisible()) {
            await modelSelect.selectOption('catboost');
        }

        // Click Predict
        await page.getByRole('button', { name: /Predict/i }).click();

        // Expect result
        await expect(page.locator('.result-container, .prediction-result')).toBeVisible();

        await page.screenshot({ path: '../qa_artifacts/screens/predictions_catboost.png' });
    });

    test('Trends page', async ({ page }) => {
        await page.goto('http://localhost:3000/trends');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('canvas, svg').first()).toBeVisible();
        await page.screenshot({ path: '../qa_artifacts/screens/trends.png' });
    });

    test('Explainability page', async ({ page }) => {
        await page.goto('http://localhost:3000/explainability');
        // Just screenshot and check for no crash
        await page.waitForTimeout(2000); // Wait for potential renders
        await page.screenshot({ path: '../qa_artifacts/screens/explainability.png' });
    });

    test('Interventions page', async ({ page }) => {
        await page.goto('http://localhost:3000/interventions');
        await expect(page.getByText(/Intervention/i).first()).toBeVisible();
        await page.screenshot({ path: '../qa_artifacts/screens/interventions.png' });
    });

    test('Alerts page', async ({ page }) => {
        await page.goto('http://localhost:3000/alerts');
        await expect(page.getByText(/Alerts/i).first()).toBeVisible();
        await page.screenshot({ path: '../qa_artifacts/screens/alerts.png' });
    });
});
