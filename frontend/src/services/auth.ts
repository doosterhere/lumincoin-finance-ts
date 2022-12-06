import PathConfig from "../../config/pathConfig";
import {ResponseDefaultType} from "../types/response-default.type";
import {UserInfoType} from "../types/user-info.type";
import {UserAdditionalInfoType} from "../types/user-additional-info.type";

export class Auth {
    static readonly accessTokenKey: string = 'accessToken';
    static readonly refreshTokenKey = 'refreshToken';
    static readonly userInfoKey = 'userInfo';
    static readonly userAdditionalInfoKey = 'userAdditionalInfo';
    static readonly catListStateKey = 'catListState';

    static async processUnauthorizedResponse(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(`${PathConfig.host}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });

            if (response && response.status === 200) {
                const result = await response.json();
                if (result && !result.error) {
                    this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    console.log('The authorization token has been successfully updated.');
                    return true;
                }
            }
        }
        this.removeTokens();
        location.href = '#/login';
        return false;
    }

    public static async logout(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(`${PathConfig.host}/logout`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });

            if (response && response.status === 200) {
                const result: ResponseDefaultType = await response.json();
                if (result && !result.error) {
                    this.removeTokens();
                    this.removeUserInfo();
                    this.removeAdditionalUserInfo();
                    this.removeCatListState();
                    return true;
                }
            }
        }
        return false;
    }

    public static setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    public static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    public static setUserInfo(info: UserInfoType): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    public static getUserInfo(): UserInfoType | null {
        const userInfo: string | null = localStorage.getItem(this.userInfoKey);
        if (userInfo) return JSON.parse(userInfo);
        return null;
    }

    public static removeUserInfo(): void {
        localStorage.removeItem(this.userInfoKey);
    }

    public static setAdditionalUserInfo(info: UserAdditionalInfoType): void {
        localStorage.setItem(this.userAdditionalInfoKey, JSON.stringify(info));
    }

    public static getAdditionalUserInfo(): UserAdditionalInfoType | null {
        const userAdditionalInfo: string | null = localStorage.getItem(this.userAdditionalInfoKey);
        if (userAdditionalInfo) return JSON.parse(userAdditionalInfo);
        return null;
    }

    public static removeAdditionalUserInfo(): void {
        localStorage.removeItem(this.userAdditionalInfoKey);
    }

    public static removeCatListState(): void {
        localStorage.removeItem(this.catListStateKey);
    }
}