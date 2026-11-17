import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
await page.goto('https://www.linkedin.com/in/pierre-cazaban-08a839382/edit/forms/summary/new/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(4500);
const txt = `L'IA change la façon dont on étudie, recrute et travaille. Mais comment prouver qu'on sait vraiment s'en servir ?

C'est ce que nous faisons chez The AI Certification : des certifications en IA (ChatGPT, Claude, Copilot, prompt engineering, automatisation) obtenues par un vrai examen, avec un certificat vérifiable publiquement et directement intégrable à LinkedIn.

Étudiant à l'IÉSEG et co-fondateur, je développe notre présence dans les écoles et universités françaises. Nous construisons un réseau d'ambassadeurs étudiants, un par école : ESCP, EDHEC, emlyon, SKEMA, IESEG, Polytechnique, NEOMA, ESSCA, ESSEC… et bientôt la vôtre.

🎓 Tu veux représenter The AI Certification dans ton école ? Réserve un appel de 45 min : the-ai-certification.com/call
🌐 the-ai-certification.com`;
const ed = page.locator('[contenteditable="true"][aria-label="À propos"]');
await ed.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Backspace');
await page.keyboard.insertText(txt); await page.waitForTimeout(800);
await page.getByRole('button', { name: /^Enregistrer$/ }).last().click(); await page.waitForTimeout(4000);
console.log('url après', page.url());
process.exit(0);
