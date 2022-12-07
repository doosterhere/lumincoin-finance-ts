import {Auth} from "./auth"
import {ResponseDefaultType} from "../types/response-default.type";

export class CustomHttp {
    public static async request(url: string, method: string = "GET", body: any = null): Promise<any> {
        const params: any = {
            method: method,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            }
        };

        let token: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (token) params.headers['x-auth-token'] = token;

        if (body) {
            params.body = JSON.stringify(body);
        }

        let response: Response | ResponseDefaultType | undefined;

        await fetch(url, params)
            .then(res => {
                response = res;
                if (response.status === 401) {
                    throw new Error('An invalid email/password has been entered or an authorization token update is required.');
                }
            })
            .catch((error) => console.log(error.message));

        if (response && ((response as Response).status < 200 || (response as Response).status > 299)) {
            if ((response as Response).status === 401) {
                const result: boolean | Function = await Auth.processUnauthorizedResponse();
                if (result as boolean) {
                    return await this.request(url, method, body);
                }

                if (!result as boolean) return null;
            }
            throw new Error((response as ResponseDefaultType).message);
        }
        return await (response as Response).json();
    }
}