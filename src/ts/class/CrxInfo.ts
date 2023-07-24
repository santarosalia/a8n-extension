export class CrxInfo {
    RECORDING_HISTORY_WINDOW_ID : number;
    TARGET_TAB : chrome.tabs.Tab;
    RECORDING_TARGET_WINDOW_ID : number;
    TARGET_TABS : chrome.tabs.Tab[];
    LAUNCHER_TAB_ID : number;
    LAUNCHER_WINDOW_ID : number;
    SELECTOR_INJECT_INTERVAL : NodeJS.Timer;
    CONTROLLER_WINDOW_ID : number
    constructor () {
        
    }
}