import {QueryParamsType} from "../types/query-params.type";

export class UrlManager {

    public static getQueryParams(): QueryParamsType {
        const queryString: string = document.location.hash.split('+').join(' ');

        let params: QueryParamsType = {},
            tokens: RegExpExecArray | null,
            regEx: RegExp = /[?&]([^=]+)=([^&]*)/g;

        while (tokens = regEx.exec(queryString)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    }
}