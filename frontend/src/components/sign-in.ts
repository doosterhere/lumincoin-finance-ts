import {Auth} from "../services/auth";
import PathConfig from "../../config/pathConfig"
import {CustomHttp} from "../services/custom-http";
import {SignInFiledType} from "../types/sign-in-filed.type";
import {ResponseSignUpType} from "../types/response-sign-up.type";
import {ResponseDefaultType} from "../types/response-default.type";

export class SignIn {
    rememberElement: HTMLElement | null = null;
    rememberElementText: HTMLElement | null = null;
    processElement: HTMLElement | null = null;
    page: string = '';
    fields: SignInFiledType[] = [];

    constructor(page: string) {
        this.page = page;
        this.fields = [
            {
                name: 'email',
                id: 'input-email',
                element: null,
                regex: /^[^$!#^\-_*'%?]*[a-z0-9\-_\.]{1,64}@[a-z0-9\.\-]{1,253}\.[a-z]{2,}$/i,
                valid: false
            },
            {
                name: 'password',
                id: 'input-password',
                element: null,
                regex: /^(?=.*\d)(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false
            }
        ];

        this.init();
    }

    private init(): void {
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        const isRemember: string | null = localStorage.getItem(Auth.userAdditionalInfoKey);

        if (this.page === 'login' && accessToken && isRemember) {
            location.href = '#/main';
            return;
        }

        if (this.page === 'signup') {
            this.fields.push(
                {
                    name: 'username',
                    id: 'input-username',
                    element: null,
                    regex: /^[А-ЯЁ][а-яё]+\s*[А-ЯЁ][а-яё]+$/,
                    valid: false
                },
                {
                    name: 'password-repeat',
                    id: 'input-password-repeat',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    valid: false
                });
        }

        const that: SignIn = this;

        this.fields.forEach((field) => {
            field.element = document.getElementById(field.id);

            if (field.element) {
                field.element.onchange = function () {
                    that.validateField.call(that, field, this as HTMLInputElement);
                }
            }
        });

        this.processElement = document.getElementById('button-process');
        if (this.processElement) {
            this.processElement.onclick = function () {
                that.processForm();
            }
        }

        if (this.page === 'login') {
            this.rememberElement = document.getElementById('checkbox');
            this.rememberElementText = document.getElementById('checkbox-text');
            if (this.rememberElementText) {
                this.rememberElementText.onclick = function () {
                    if (that.rememberElement)
                        (that.rememberElement as HTMLInputElement).checked =
                            !(that.rememberElement as HTMLInputElement).checked;
                }
            }

            if (Auth.getAdditionalUserInfo()) {
                const registeredEmail: string | undefined = Auth.getAdditionalUserInfo()?.registeredEmail;
                if (registeredEmail) {
                    (that.fields.find(field => field.name === 'email')?.element as HTMLInputElement).value =
                        registeredEmail;
                }
                const emailElement = that.fields.find(field => field.name === 'email')?.element;
                if (emailElement) {
                    this.validateField(this.fields.find(field => field.name === 'email') as SignInFiledType, emailElement as HTMLInputElement);
                }
            }
        }
    }

    private validateField(field: SignInFiledType, element: HTMLInputElement): void {
        if (!element.value || !element.value.match(field.regex)) {
            element.classList.add('border-danger');
            field.valid = false;
        }

        if (element.value && element.value.match(field.regex)) {
            element.classList.remove('border-danger');
            field.valid = true;
        }

        if (field.valid && field.name === 'password-repeat' && element.value !==
            (this.fields.find(field => field.name === 'password')?.element as HTMLInputElement).value) {
            element.classList.add('border-danger');
            field.valid = false;
        }

        this.validateForm();
    }

    private validateForm(): boolean | void {
        if (this.processElement) {
            const isValid: boolean = this.fields.every(field => field.valid);

            if (!isValid) {
                this.processElement.classList.add('disabled');
                return false;
            }

            this.processElement.classList.remove('disabled');
            return true;
        }
    }

    private async processForm(): Promise<void> {
        const email: string = (this.fields.find(field => field.name === 'email')?.element as HTMLInputElement).value;
        const password: string = (this.fields.find(field => field.name === 'password')?.element as HTMLInputElement).value;

        if (this.validateForm()) {
            if (this.page === 'signup') {
                try {
                    const username: string[] =
                        (this.fields.find(field => field.name === 'username')?.element as HTMLInputElement).value.split(/\s+/);
                    const result: ResponseSignUpType | ResponseDefaultType =
                        await CustomHttp.request(`${PathConfig.host}/signup`, 'POST', {
                            name: username[0],
                            lastName: username[1],
                            email: email,
                            password: password,
                            passwordRepeat: (this.fields.find(field => field.name === 'password-repeat')?.element as HTMLInputElement).value,
                        });

                    if (result) {
                        if ((result as ResponseDefaultType).error) {
                            throw new Error((result as ResponseDefaultType).message);
                        }
                        Auth.setAdditionalUserInfo({
                            registeredEmail: email,
                            rememberMe: false
                        });
                        console.log('Registration has been successful.');
                        location.href = '#/login';
                        return;
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            try {
                const result = await CustomHttp.request(`${PathConfig.host}/login`, 'POST', {
                    email: email,
                    password: password,
                    rememberMe: (this.rememberElement as HTMLInputElement).checked
                });

                if (result) {
                    if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken || !result.user.name || !result.user.lastName || !result.user.id) {
                        throw new Error(result.message);
                    }
                    Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    Auth.setUserInfo({
                        firstName: result.user.name,
                        lastName: result.user.lastName,
                        id: result.user.id
                    });

                    if (this.rememberElement && (this.rememberElement as HTMLInputElement).checked) {
                        Auth.setAdditionalUserInfo({
                            registeredEmail: email,
                            rememberMe: true
                        });
                    }
                    location.href = '#/main';
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}