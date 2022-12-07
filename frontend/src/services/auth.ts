import PathConfig from "../../config/pathConfig";
import {ResponseDefaultType} from "../types/response-default.type";
import {UserInfoType} from "../types/user-info.type";
import {UserAdditionalInfoType} from "../types/user-additional-info.type";

export class Auth {
    public static readonly accessTokenKey: string = 'accessToken';
    private static readonly refreshTokenKey = 'refreshToken';
    private static readonly userInfoKey = 'userInfo';
    public static readonly userAdditionalInfoKey = 'userAdditionalInfo';
    private static readonly reRefreshTokenCountKey = 'reRefreshCount';

    public static async processUnauthorizedResponse(): Promise<boolean | Function> {
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
                    this.removeReRefreshTokenCount();
                    console.log('The authorization token has been successfully updated.');
                    return true;
                }
            }
            const result = JSON.parse(await response.text());
            if (response && response.status === 400 && result.message.toLowerCase() === 'invalid refresh token') {
                const count: number | null = this.getReRefreshTokenCount();

                if (count && count > 10) {
                    console.log('Re-refreshing process has been stopped to avoid looping. Please, try again later...');
                    this.removeReRefreshTokenCount();
                    return false;
                }

                if (count) this.setReRefreshTokenCount(count + 1);

                if (!count) this.setReRefreshTokenCount(1);

                console.log(`Re-refresh authorization token is needed (attempt: ${count ? count : 0})...`);
                return await this.processUnauthorizedResponse();
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
                    this.removeReRefreshTokenCount();
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

    private static setReRefreshTokenCount(count: number): void {
        localStorage.setItem(this.reRefreshTokenCountKey, JSON.stringify(count));
    }

    private static getReRefreshTokenCount(): number | null {
        const count: string | null = localStorage.getItem(this.reRefreshTokenCountKey);
        if (count) return Number(JSON.parse(count));
        return null;
    }

    private static removeReRefreshTokenCount(): void {
        localStorage.removeItem(this.reRefreshTokenCountKey);
    }
}