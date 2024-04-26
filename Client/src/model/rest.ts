import {useToast} from "vue-toastification";
import {getSession} from "@/model/session";
import {MyError} from "@/model/MyError";
import { StatusCodes } from "http-status-codes";
import type {DynamicDataEnvelope} from "@/model/TransferTypes";

const API_ROOT: string = import.meta.env.VITE_API_ROOT;

async function rest(url: string, body?: unknown, method?: string, headers?: any) {
    const session = getSession();
    session.loading++;
    if(session.token) {
        headers = headers ?? {};
        headers.Authorization = `Bearer ${session.token}`;
    }
    console.debug("rest.ts rest url: " + url)
    console.debug("rest.ts rest body: " + JSON.stringify(body))
    console.debug("rest.ts rest method: " + method)
    console.debug("rest.ts rest headers: " + headers)
    return await fetch(url, {
        method: method ?? (body ? "POST" : "GET"),
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: JSON.stringify(body)
    })
        .then(response => {
            console.log("rest.ts rest response: ", response);
            const ret = response.ok ? response.json() : response.json().then(err => {
                showError(new MyError(response.status, err.message));
                return Promise.reject(err);
            })
            console.log("rest.ts rest ret: ", ret);
            return ret;
        })
        .catch(() => {})
        .finally(() => session.loading--);
}

export async function api<T>(endpointURL: string, body?: unknown, method?: string, headers?: any) : Promise<DynamicDataEnvelope<T>> {
    return await rest(`${API_ROOT}/${endpointURL}`, body, method, headers)
        .catch(() => {});
}

function showError(error: MyError): void {
    const toast = useToast();
    error.locationData
        ? console.error("Error " + error.code + " (" + StatusCodes[error.code] + "):\nError Message: " + error.message + "\nthrown from " + error.locationData.fileName + " at line " + error.locationData.lineNum)
        : console.error("Error " + error.code + " (" + StatusCodes[error.code] + "):\nError Message: " + error.message + "\nthrown from rest.ts");
    getSession().messages.push({type: "error", message: error.message});
    toast.error(error.message);
}