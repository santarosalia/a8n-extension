import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from './App'
import { Provider } from "react-redux";
import { store } from '@/ts/store'
import Snackbar from "./components/Snackbar";
let root = document.getElementById("root");
if (!root) {
    root = document.createElement('div');
    root.id = 'crx-root';
    document.body.append(root);
}

ReactDOM.createRoot(root).render(
    <StrictMode>
        <Provider store={store}>
        <App />
        <Snackbar/>
        </Provider>
    </StrictMode>
);