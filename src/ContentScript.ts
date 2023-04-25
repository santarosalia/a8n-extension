import { webRecorder } from "@/ts/contents/WebRecorder";


// try { 
    
// } catch {}

// console.log('%c startedv','color:red')


chrome.runtime.onMessage.addListener(webRecorder);