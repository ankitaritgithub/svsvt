import { test } from '@playwright/test';
import * as XLSX from 'xlsx';
import * as path from 'path';

interface ReportLink {
  URL: string;
  ReportLink: string;
}

function readUrlsFromXLSX(filePath: string): { URL: string }[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return data as { URL: string }[];
}

test('Fetch PageSpeed reports from input_urls.xlsx and save to output XLSM', async ({ page }) => {
  const inputFilePath = path.resolve(__dirname, 'input_urls.xlsx');
  const urls = readUrlsFromXLSX(inputFilePath);
  
  const reportLinks: ReportLink[] = [];

  for (const { URL } of urls) {
    await page.goto('https://pagespeed.web.dev/');
    await page.getByPlaceholder('Enter a web page URL').click();
    await page.getByPlaceholder('Enter a web page URL').fill(URL);
    await page.getByRole('button', { name: 'Analyze' }).click();
    await page.getByRole('button', { name: 'Copy Link' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Copy Link' }).click();
    
    const copiedLink = await page.evaluate(() => navigator.clipboard.readText());
    console.log(`Copied Link for ${URL}: ${copiedLink}`);
    
    reportLinks.push({ URL, ReportLink: copiedLink });
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(reportLinks);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PageSpeed Reports');

  const outputFilePath = 'pagespeed_reports.xlsm';
  XLSX.writeFile(workbook, outputFilePath);
  console.log(`Saved report links to ${outputFilePath}`);
});