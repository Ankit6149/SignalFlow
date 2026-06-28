import fs from "fs";
import path from "path";

/**
 * EXPERIMENTAL/INTERNAL ONLY - Not used in main V1 product path.
 * Retained for future automation modules.
 * Headless capture of an app URL using Playwright.
 * Saves screenshot to the public directory.
 * Falls back gracefully if Playwright is not installed or errors.
 */
export async function captureAppScreenshot(appUrl) {
  if (!appUrl) {
    return {
      success: false,
      warnings: ["No app URL provided for screenshot capture."]
    };
  }

  const warnings = [];
  const filename = `capture-${new Date().getTime()}.png`;
  
  // Save screenshots in `frontend/public/captures` so Next.js can serve them
  // We determine the path relative to process.cwd() (which in Next.js is the project root, i.e., "frontend")
  const publicDirPath = path.join(process.cwd(), "public", "captures");
  const savePath = path.join(publicDirPath, filename);
  const relativeWebPath = `/captures/${filename}`;

  try {
    // Dynamic import of playwright
    let playwrightModule;
    try {
      playwrightModule = await import(/* webpackIgnore: true */ "playwright");
    } catch (err) {
      // Playwright not available in environment
      return {
        success: false,
        warnings: ["Playwright is not installed in this environment. Screenshot capture skipped. Please upload screenshots manually."]
      };
    }

    // Ensure public/captures directory exists
    if (!fs.existsSync(publicDirPath)) {
      fs.mkdirSync(publicDirPath, { recursive: true });
    }

    const { chromium } = playwrightModule;
    
    // Launch headless chromium
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    
    const page = await context.newPage();
    
    // Load page with timeout
    await page.goto(appUrl, {
      waitUntil: "networkidle",
      timeout: 10000 // 10s timeout
    });
    
    // Take screenshot
    await page.screenshot({ path: savePath, type: "png" });
    
    await browser.close();

    return {
      success: true,
      path: relativeWebPath,
      name: filename,
      url: relativeWebPath,
      warnings: []
    };

  } catch (err) {
    return {
      success: false,
      warnings: [`Automated app screenshot failed: ${err.message}. Continue with manual assets.`]
    };
  }
}
