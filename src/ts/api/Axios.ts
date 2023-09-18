import Axios from 'axios';

export const accessToken = async () => {
    const result = await chrome.storage.local.get('user');
    // if (result.user && result.user.accessToken) return `Bearer ${result.user.accessToken}`;
    if (result.user && result.user.accessToken) return result.user.accessToken;
    else return '';
}

export const axios = Axios.create({
    baseURL : 'http://localhost:3000',
    
});