import { test, expect } from "@playwright/test";

test.describe("Herbal Link — smoke", () => {
  test("home loads hero and title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Herbal Link \| Home/);
    await expect(page.locator("h1.main__title")).toHaveText("Herbal Link");
  });

  test("header navigates to Directory", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "Directory", exact: true }).click();
    await expect(page).toHaveURL(/directory(\.html)?$/);
    await expect(page.locator("h1.main__title")).toHaveText("Herbal Directory");
  });

  test("directory opens Chamomile herb page", async ({ page }) => {
    await page.goto("/directory.html");
    await page.getByRole("link", { name: /Chamomile/i }).first().click();
    await expect(page).toHaveURL(/herbs\/chamomile(\.html)?$/);
    await expect(page.locator("h1.main__title")).toHaveText("Chamomile");
  });

  test("testimonial slider advances", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Avery Nguyen" })).toBeVisible();
    await page.getByRole("button", { name: "Next testimonial" }).click();
    await expect(page.getByRole("heading", { name: "Jordan Fields" })).toBeVisible();
  });

  test("contact form shows validation when submitted empty", async ({ page }) => {
    await page.goto("/contact.html");
    await page.getByRole("button", { name: "Send Message" }).click();
    await expect(page.getByText("Full Name is required.")).toBeVisible();
    await expect(page.getByText("Email Address is required.")).toBeVisible();
  });

  test("contact form succeeds with mocked FormSubmit", async ({ page }) => {
    await page.route("**/formsubmit.co/ajax/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/contact.html");
    await page.locator("#contact-full-name").fill("Playwright User");
    await page.locator("#contact-email").fill("e2e@example.com");
    await page.locator("#contact-subject").fill("E2E test");
    await page.locator("#contact-message").fill("Automated smoke test message.");
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(page.locator("#contact-form-success")).toBeVisible();
    await expect(page.locator("#contact-form-success")).toContainText(/sent successfully/i);
  });
});
