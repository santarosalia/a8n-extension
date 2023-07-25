import { BrowserController } from '../class/CrxBrowserController';
import { BrowserAction, CRX_COMMAND, ConnectOptionType, LocatorType } from '@CrxConstants';

export const test = async () => {
    const window = await chrome.windows.create({
        url : 'https://search.naver.com/search.naver?where=news&sm=tab_jum&query=rpa'
    });
    const [tab] = window.tabs;
    const browserController = new BrowserController(tab);

    await browserController.execute({
        command : CRX_COMMAND.CMD_CRX_EXECUTE_ACTION,
        object : {
            action : BrowserAction.CONNECT,
            parameter : {
                connectOption : {
                    type : ConnectOptionType.INSTANCE_UUID,
                    value : '',
                    isContains : true
                }
            }
        },
        tranId : 0
    });

    await browserController.execute({
        command : CRX_COMMAND.CMD_CRX_EXECUTE_ACTION,
        object : {
            action : BrowserAction.DATA_SCRAPING,
            parameter : {
                dataScrapingOption : {
                    patternArray : ['li > div.news_wrap.api_ani_send:nth-of-type(1)>div.news_area:nth-of-type(1)>a.news_tit:nth-of-type(1)'],
                    columnSizeArray : [2],
                    exceptColumnArray : [],
                    exceptRowArray : [],
                    pageCount : 1,
                    nextPageButtonXpath : null,
                    nextPageNumberXpath : null
                }
            }
        },
        tranId : 0
    });
    
}