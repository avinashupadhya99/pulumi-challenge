const playwright = require("playwright");
const expect = require("expect");

const browser = await playwright.chromium.launch();
const page = await browser.newPage();

const response = await page.goto("https://{{websiteUrl}}");

expect(await page.title()).toBe("Pulumi Challenge");
expect(await response.status()).toBe(200);


await browser.close();