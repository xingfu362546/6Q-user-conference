const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  await page.goto("file:///d:/Cursor/testProject/0427-%E6%97%A5%E5%BF%97%E5%8D%B0%E8%AE%B0%E5%88%87%E6%8D%A2%E5%8E%9F%E5%9E%8B.html");
  await page.click('[data-mode="mark"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: "d:/Cursor/testProject/output/0427-日志印记切换原型-印记态.png" });
  await browser.close();
})();
