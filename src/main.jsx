import React from "react";
import ReactDOM from "react-dom/client";
// import "./index.css";
import App from './App'

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