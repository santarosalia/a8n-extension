import { FetchURL, Method } from '@CrxInterface';

class FetchLM {
    baseURL: string
    constructor () {
        this.baseURL = import.meta.env.VITE_HOME;
    }
    async get (URL: FetchURL, parameter?: string) {
        parameter = parameter ? `/${parameter}` : '';
        const response = await fetch(this.baseURL + URL + parameter, {
            method : Method.GET,
        });
        if (!response.ok) throw response;
        return await response.json();
    }
    async post (URL: FetchURL, body?: string) {
        const response = await fetch(this.baseURL + URL, {
            method : Method.POST,
            body : body
        });
        if (!response.ok) throw response;
        return await response.json();
    }
    async put (URL: FetchURL, body?: string) {
        const response = await fetch(this.baseURL + URL, {
            method : Method.PUT,
            body : body
        });
        if (!response.ok) throw response;
        return await response.json();
    }
    async delete (URL: FetchURL) {
        const response = await fetch(this.baseURL + URL, {
            method : Method.DELETE,
        });
        if (!response.ok) throw response;
        return await response.json();
    }
}

export const fetchLM = new FetchLM();

export const fetchUser = async () => {
    const res = await fetchLM.get(FetchURL.user);
    return res;
}

export const fetchProcesses = async () => {
    const result = await fetchLM.get(FetchURL.process);
    return result;
}

export const fetchProcess = async (processId: string) => {
    const result = await fetchLM.get(FetchURL.process, processId);
    return result;
}

export const putProcess = async (body: string) => {
    const result = await fetchLM.put(FetchURL.process, body);
    return result;
}