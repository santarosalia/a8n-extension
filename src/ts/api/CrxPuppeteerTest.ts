import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web'

import { ExtensionDebuggerTransport } from 'puppeteer-extension-transport'
import { sleep } from './CrxApi';
// import { Browser, Page, ElementHandle, Frame, Dialog } from "puppeteer-core/lib/cjs/puppeteer/api-docs-entry";


export const test = async () => {
    const window = await chrome.windows.create({
        url : 'https://www.mfds.go.kr/brd/m_211/list.do'
    });
    // const window = await chrome.windows.create({
    //     url : 'https://naver.com'
    // });
    const [tab] = window.tabs;
    const transport = await ExtensionDebuggerTransport.create(tab.id);
    
    const instance = await puppeteer.connect({
        transport : transport,
        defaultViewport : null
    });
    await sleep(3000)
    
    console.log(instance)
    
    const [page] = await instance.pages();
    // console.log(page)
    const frame = page.mainFrame();
    // await sleep(2000)
    const findFrame = frame.childFrames().find(frame => frame.name() === 'h_blank');
    console.log(findFrame)
    const icon = await findFrame.waitForSelector('body');
    console.log(icon);
    console.log('end')
}