// Headless browser for screenshots: nothing shows on the user's screen.
import { chromium } from 'playwright';
export async function headless() {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  return { browser: b, page: await b.newPage() };
}
