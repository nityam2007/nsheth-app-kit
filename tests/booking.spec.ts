import { expect, test } from "@playwright/test";

test("service lifecycle, anonymous isolation, booking capacity and cancellation", async ({
  page,
  browser,
}) => {
  const slug = `test-service-${Date.now()}`;
  await page.goto("/");
  await page.getByRole("button", { name: "Run identity check" }).click();
  await expect(page.getByText("admin@demo.local").first()).toBeVisible();
  await page.goto("/admin/services/new");
  await page.getByLabel("Service name").fill(slug);
  await page.getByLabel("Summary", { exact: true }).fill("A test appointment");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A complete service lifecycle test.");
  await page
    .getByRole("button", { name: "Create service", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(`/admin/services/${slug}$`));
  const anonymous = await browser.newContext();
  const visitor = await anonymous.newPage();
  const base = new URL(page.url()).origin;
  const draft = await visitor.goto(`${base}/services/${slug}`);
  expect(draft?.status()).toBe(404);
  await page.getByRole("link", { name: "Edit service", exact: true }).click();
  await page.getByLabel("Visibility").selectOption("PUBLISHED");
  await page.getByRole("button", { name: "Save service", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/services/${slug}$`));
  await page.getByLabel("Starts at").fill("2027-06-10T12:00");
  await page.getByRole("button", { name: "Add slot", exact: true }).click();
  await expect(page.getByText(/1 places · 0 requests/)).toBeVisible();
  await visitor.goto(`${base}/services/${slug}`);
  await visitor.getByLabel("Your name").fill("Test Visitor");
  await visitor
    .getByLabel("Email", { exact: true })
    .fill(`${slug}@example.com`);
  await visitor
    .getByRole("button", { name: "Request appointment", exact: true })
    .click();
  await expect(
    visitor.getByText("Your request has been received."),
  ).toBeVisible();
  await visitor.reload();
  await expect(visitor.getByText(/No appointments available/)).toBeVisible();
  await page.goto("/admin/bookings");
  const card = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: slug, exact: true }) });
  await card.getByLabel("Next status").selectOption("CANCELLED");
  await card.getByRole("button", { name: "Update request" }).click();
  await expect(card.getByText("CANCELLED", { exact: true })).toBeVisible();
  await visitor.reload();
  await expect(
    visitor.getByRole("button", { name: "Request appointment" }),
  ).toBeVisible();
  await visitor.setViewportSize({ width: 390, height: 844 });
  expect(
    await visitor.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto(`/admin/services/${slug}/edit`);
  await page.getByLabel("Visibility").selectOption("DRAFT");
  await page.getByRole("button", { name: "Save service", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/services/${slug}$`));
  await anonymous.close();
});
