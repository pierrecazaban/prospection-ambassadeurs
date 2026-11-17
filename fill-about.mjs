import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/edit/forms/summary/'));
const txt = `L'IA change la façon dont on étudie, recrute et travaille. Mais comment prouver qu'on sait vraiment s'en servir ?

C'est ce que nous faisons chez The AI Certification : des certifications en IA (ChatGPT, Claude, Copilot, prompt engineering, automatisation) obtenues par un vrai examen, avec un certificat vérifiable publiquement et directement intégrable à LinkedIn.

Étudiant à l'IÉSEG, je développe notre présence dans les écoles et universités françaises. Nous construisons un réseau d'ambassadeurs étudiants, un par école : ESCP, EDHEC, emlyon, SKEMA, IESEG, Polytechnique… et bientôt la vôtre.

🎓 Étudiant intéressé pour représenter The AI Certification dans ton école ? Écris-moi.
🌐 the-ai-certification.com`;
const ed = page.locator('[contenteditable="true"][aria-label="À propos"]');
await ed.click();
await page.keyboard.insertText(txt);
await page.waitForTimeout(800);
console.log((await ed.innerText()).slice(0, 400), '\n...\n', (await ed.innerText()).length, 'caractères');
process.exit(0);
