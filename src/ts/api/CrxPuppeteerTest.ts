import { BrowserController } from '../class/CrxBrowserController';
import { BrowserAction, CRX_COMMAND, ConnectOptionType, ElementAction, LocatorType } from '@CrxConstants';

const evaluateTest = async () => {
    const window = await chrome.windows.create({
        url : 'https://naver.com'
    });

    const [tab] = window.tabs;
    const browserController = new BrowserController(tab);

    await browserController.execute({
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
    });
    
    // const evaluateResult = await browserController.execute({
    //     object : {
    //         action : BrowserAction.EVALUATE,
    //         instanceUUID : '',
    //         parameter : {
    //             script : 'return document.querySelector("#search-btn").click();'
    //         }
    //     },
    // });

    // console.log(evaluateResult);
    const query = await browserController.execute({
        object : {
            action : BrowserAction.WAIT,
            instanceUUID : '',
            parameter : {
                locatorType : LocatorType.CSS_SELECTOR,
                locator : '#query'
            }
        },
    });
    await browserController.execute({
        object : {
            action : ElementAction.TYPE,
            instanceUUID : query.instanceUUID,
            parameter : {
                text : '안녕하세요'
            }
        },
    });
}

const recorderScrapingTest = async () => {
    const window = await chrome.windows.create({
        url : 'https://search.naver.com/search.naver?where=news&sm=tab_jum&query=rpa'
    });
    const [tab] = window.tabs;
    const browserController = new BrowserController(tab);

    await browserController.execute({
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
    });
    

    const result = await browserController.execute({
        object : {
            action : BrowserAction.BROWSER_RECORDER_SCRAPING,
            parameter : {
                dataScrapingOptionString : '{"patternArray": ["li > div.news_wrap.api_ani_send:nth-of-type(1)>div.news_area:nth-of-type(1)>a.news_tit:nth-of-type(1)", "li > div.news_wrap.api_ani_send:nth-of-type(1)>div.news_area:nth-of-type(1)>div.news_dsc:nth-of-type(2)>div.dsc_wrap:nth-of-type(1)>a.api_txt_lines.dsc_txt_wrap:nth-of-type(1)"], "columnSizeArray": [2, 2], "exceptColumnArray": [[0], [1]], "exceptRowArray":[], "pageCount": 5, "nextPageButtonXpath": "//*[@id=\"main_pack\"]/div[2]/div/a[2]", "nextPageNumberXpath": "//*[@id=\"main_pack\"]/div[2]/div/div/a[2]"}'
            }
        },
    });
    

    console.log(result);
}

const setClipboardImageTest = async () => {
    const window = await chrome.windows.create({
        url : 'https://smartstore.naver.com/ddangsam/products/9025743442?NaPm=ct%3Dlmfxrq60%7Cci%3Df4f7f99f9cec87639a9b34d80106a6c9f7130801%7Ctr%3Dimg%7Csn%3D843927%7Chk%3D976094d7697726c02ba6ca8fee3f4cb4d28d35fa'
    });

    const [tab] = window.tabs;
    const browserController = new BrowserController(tab);

    await browserController.execute({
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
    });
    const query = await browserController.execute({
        object : {
            action : BrowserAction.WAIT,
            parameter : {
                locatorType : LocatorType.CSS_SELECTOR,
                locator : '#content > div > div._2-I30XS1lA > div._3rXou9cfw2._3SDVmcn7nN > div.bd_23RhM > div.bd_1uFKu.bd_2PG3r > img'
            }
        },
    });

    await browserController.execute({
        
        object : {
            instanceUUID : query.instanceUUID,
            action : ElementAction.CLIPBOARD_WRITE,
        }
    });

}

const setClipboardTableTest = async () => {
    const window = await chrome.windows.create({
        url : 'https://finance.naver.com/'
    });

    const [tab] = window.tabs;
    const browserController = new BrowserController(tab);

    await browserController.execute({
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
    });
    const query = await browserController.execute({
        object : {
            action : BrowserAction.WAIT,
            parameter : {
                locatorType : LocatorType.CSS_SELECTOR,
                locator : '#content > div.article > div.section > div.section_sise_top > div.group_type.is_active'
            }
        },
    });

    await browserController.execute({
        
        object : {
            instanceUUID : query.instanceUUID,
            action : ElementAction.CLIPBOARD_WRITE,

        }
    });

}

const setClipboardTextTest = async () => {
    const window = await chrome.windows.create({
        url : 'https://search.naver.com/search.naver?where=news&sm=tab_jum&query=rpa'
    });

    const [tab] = window.tabs;
    const browserController = new BrowserController(tab);

    await browserController.execute({
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
    });
    const query = await browserController.execute({
        object : {
            action : BrowserAction.WAIT,
            parameter : {
                locatorType : LocatorType.CSS_SELECTOR,
                locator : '#sp_nws1 > div.news_wrap.api_ani_send > div > div.news_dsc > div > a'
            }
        },
    });

    await browserController.execute({
        
        object : {
            instanceUUID : query.instanceUUID,
            action : ElementAction.CLIPBOARD_WRITE,
        }
    });

}

const getOuterHTMLTest = async () => {
    const window = await chrome.windows.create({
        url : 'https://naver.com'
    });

    const [tab] = window.tabs;
    const browserController = new BrowserController(tab);

    await browserController.execute({
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
    });
    
    const query = await browserController.execute({
        object : {
            action : BrowserAction.WAIT,
            parameter : {
                locatorType : LocatorType.CSS_SELECTOR,
                locator : 'body'
            }
        },
    });

    const result = await browserController.execute({
        
        object : {
            instanceUUID : query.instanceUUID,
            action : ElementAction.GET_OUTERHTML,
        }
    });

    console.log(result);
}
// export const test = setClipboardImageTest;
// export const test = setClipboardTableTest;
export const test = evaluateTest;