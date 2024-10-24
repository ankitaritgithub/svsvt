// @ts-check
import { chromium } from 'playwright';
import { test } from '@playwright/test'; 
import thresholds from '/home/xs427-anksin/Documents/task/thresholds.js';
const { playAudit } = await import('playwright-lighthouse');


const lighthouseDesktopConfig = {
    extends: 'lighthouse:default',
    settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    },
};

async function runLighthouseTest() {
    const browser = await chromium.launch({
        args: ['--remote-debugging-port=9222'],
        headless: true,
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://pagespeed.web.dev/'); 

    // Run Lighthouse audit
    await playAudit({
        page: page,
        config: lighthouseDesktopConfig,
        thresholds: thresholds,
        port: 9222,
        opts: { logLevel: 'info' },
        reports: {
            formats: { html: true },
            name: `lighthouse-${new Date().toISOString()}`,
            directory: `${process.cwd()}/lighthouse`,
        },
    });

    await browser.close();
}

test('Lighthouse Performance Test', runLighthouseTest);
