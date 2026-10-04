import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
await p.goto("http://localhost:8080/index.html");
await p.waitForTimeout(1500);
await p.screenshot({ path: "docs/dashboard.png", fullPage: true });
await b.close();