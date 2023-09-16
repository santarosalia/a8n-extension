import React from "react";
import ReactDOM from "react-dom/client";
// import "./index.css";
import App from './App'

// const storageChanged = (changes: chrome.storage.StorageChange) => {
//     console.log(changes);
// }
// chrome.storage.local.onChanged.addListener(storageChanged);

let root = document.getElementById("root");
if (!root) {
    root = document.createElement('div');
    root.id = 'crx-root';
    document.body.append(root);
}

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);