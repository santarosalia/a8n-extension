import { createWindow, currentWindowTabs, findTabsByTitle } from "@CrxApi";
import { Browser } from "puppeteer-core/lib/cjs/puppeteer/api-docs-entry";
import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web'
import { ExtensionDebuggerTransport } from 'puppeteer-extension-transport'

export class PuppeteerController {
    browser : Browser
    constructor () {

    }

    async connect(title : string) {
        const [tab] = await findTabsByTitle(title);
        if (tab) {
            const transport = await ExtensionDebuggerTransport.create(tab.id);
            const browser = await puppeteer.connect({
                transport : transport,
                defaultViewport : null
            });
            this.browser = browser;
        }
        
    }

    async create() {
        const window = await createWindow();
        const [tab] = await currentWindowTabs(window.id);
        const transport = await ExtensionDebuggerTransport.create(tab.id);
        const browser = await puppeteer.connect({
            transport : transport,
            defaultViewport : null
        });
        
        this.browser = browser;
    }

    async run() {
        const browser = this.browser;

        // use first page from pages instead of using browser.newPage()
        const [page] = await browser.pages();
        
        page.on('dialog', async dialog => {
            
            console.log();
            await dialog.accept();
        });
        
        await page.goto('https://globalkoreamarket.go.kr:8843/gpass/index.do');
        await page.waitForTimeout(2000);
        const page2 = await browser.newPage();
        await page2.goto('https://naver.com');
        const loginBtn = await page.waitForXPath('//*[@id="header"]/div[1]/div[1]/ul/li[6]/a');
        await loginBtn.click();
        
        // pages.forEach(async page => {
        //     const title = await page.title();
        //     console.log(title)
        // })
        // const screenshot = await page.screenshot({
        //     encoding: 'base64',
        // });
        // console.log(`data:image/png;base64,${screenshot}`)
        
        
        
        // const query = await page.$x('//*[@id="query"]');
        // await query[0].type('abc')
        // const englishButton = await page.waitForSelector('#js-link-box-en > strong')
        // await englishButton.click()
        // const searchBox = await page.waitForSelector('#searchInput');
        // await searchBox.type('telephone')

        // await page.keyboard.press('Enter')
        
        // await page.close();
        console.log('end')
    }
}