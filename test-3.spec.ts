import { test } from '@playwright/test';
import * as XLSX from 'xlsx';
import * as path from 'path';

interface ReportLink {
  URL: string;
  ReportLink: string;
  'Performance Score': number;
  'SEO Score': number;
  'PWA Score': number;
  'Load Time (seconds)': number;
  'First Contentful Paint (seconds)': number;
  'Largest Contentful Paint (seconds)': number;
  'Total Blocking Time (seconds)': number;
  'Speed Index (seconds)': number;
  'Cumulative Layout Shift (CLS)': number;
  'Strategy': string;
  'Status': string;
}

function readUrlsFromXLSX(filePath: string): { URL: string }[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return data as { URL: string }[];
}

test('Fetch PageSpeed reports from XLSX input and save to XLSM output', async ({ page }) => {
  const inputFilePath = path.resolve(__dirname, '/home/xs427-anksin/Desktop/playwrites_demo/input_urls.xlsx');
  const urls = readUrlsFromXLSX(inputFilePath);
  
  const reportLinks: ReportLink[] = [];

  for (const { URL } of urls) {
    try {
      await page.goto('https://pagespeed.web.dev/');
      await page.getByPlaceholder('Enter a web page URL').fill(URL);
      await page.getByRole('button', { name: 'Analyze' }).click();
      await page.waitForSelector('div[class*="results"]', { timeout: 30000 });

      const performance_score = await page.evaluate(() => parseFloat(document.querySelector('.performance-score-selector')?.textContent || '0'));
      const seo_score = await page.evaluate(() => parseFloat(document.querySelector('.seo-score-selector')?.textContent || '0'));
      const pwa_score = await page.evaluate(() => parseFloat(document.querySelector('.pwa-score-selector')?.textContent || '0'));
      const load_time = await page.evaluate(() => parseFloat(document.querySelector('.load-time-selector')?.textContent || '0'));
      const fcp = await page.evaluate(() => parseFloat(document.querySelector('.fcp-selector')?.textContent || '0'));
      const lcp = await page.evaluate(() => parseFloat(document.querySelector('.lcp-selector')?.textContent || '0'));
      const ttb = await page.evaluate(() => parseFloat(document.querySelector('.ttb-selector')?.textContent || '0'));
      const speed_index = await page.evaluate(() => parseFloat(document.querySelector('.speed-index-selector')?.textContent || '0'));
      const cls = await page.evaluate(() => parseFloat(document.querySelector('.cls-selector')?.textContent || '0'));
      const strategy = 'mobile'; 

      await page.getByRole('button', { name: 'Copy Link' }).waitFor({ state: 'visible' });
      await page.getByRole('button', { name: 'Copy Link' }).click();
      const copiedLink = await page.evaluate(() => navigator.clipboard.readText());

      reportLinks.push({
        URL,
        ReportLink: copiedLink,
        'Performance Score': performance_score,
        'SEO Score': seo_score,
        'PWA Score': pwa_score,
        'Load Time (seconds)': load_time,
        'First Contentful Paint (seconds)': fcp,
        'Largest Contentful Paint (seconds)': lcp,
        'Total Blocking Time (seconds)': ttb,
        'Speed Index (seconds)': speed_index,
        'Cumulative Layout Shift (CLS)': cls,
        'Strategy': strategy,
        'Status': 'Success'
      });
    } catch (error) {
      console.error(`Error processing URL ${URL}: ${error}`);
      reportLinks.push({
        URL,
        ReportLink: '',
        'Performance Score': 0,
        'SEO Score': 0,
        'PWA Score': 0,
        'Load Time (seconds)': 0,
        'First Contentful Paint (seconds)': 0,
        'Largest Contentful Paint (seconds)': 0,
        'Total Blocking Time (seconds)': 0,
        'Speed Index (seconds)': 0,
        'Cumulative Layout Shift (CLS)': 0,
        'Strategy': '',
        'Status': 'Failed'
      });
    }
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(reportLinks);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PageSpeed Reports');
  const outputFilePath = 'pagespeed_reports.xlsm';
  XLSX.writeFile(workbook, outputFilePath);
  console.log(`Saved report links to ${outputFilePath}`);
});
