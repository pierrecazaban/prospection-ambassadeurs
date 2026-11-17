import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
const page = await b.contexts()[0].newPage();
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
await page.locator('main a[aria-label^="Inviter "], main button[aria-label^="Inviter "]').filter({ visible: true }).first().click();
await page.waitForTimeout(3000);
const s = await page.context().newCDPSession(page);
await s.send('DOM.getDocument', { depth: -1, pierce: true });
for (const text of ['Envoyer sans note', 'Ajouter une note']) {
  const { searchId, resultCount } = await s.send('DOM.performSearch', { query: text, includeUserAgentShadowDOM: true });
  console.log(text, '→ résultats :', resultCount);
  if (resultCount) {
    const { nodeIds } = await s.send('DOM.getSearchResults', { searchId, fromIndex: 0, toIndex: resultCount });
    for (const id of nodeIds) { try { const { model } = await s.send('DOM.getBoxModel', { nodeId: id }); console.log('   boîte', model.content.slice(0, 2)); } catch { console.log('   (texte sans boîte)'); } }
  }
}
await page.keyboard.press('Escape'); await page.waitForTimeout(800); await page.close(); process.exit(0);
