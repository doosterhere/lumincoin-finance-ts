import {Auth} from "../services/auth";
import {Balance} from "./balance";
import {UserInfoType} from "../types/user-info.type";
import {LocationType} from "../types/location.type";

export class Sidebar {
    balanceElement: HTMLElement | null = null;
    userNameElement: HTMLElement | null = null;
    buttonMain: HTMLElement | null = null;
    buttonBalance: HTMLElement | null = null;
    buttonCategories: HTMLElement | null = null;
    buttonIncomes: HTMLElement | null = null;
    buttonExpenses: HTMLElement | null = null;
    subMenu: Element | null = null;
    location: string = '';

    constructor() {
        this.init();
    }

    init() {
        this.userNameElement = document.getElementById('user-name');
        this.buttonMain = document.getElementById('buttonMain');
        this.buttonBalance = document.getElementById('buttonBalance');
        this.buttonCategories = document.getElementById('buttonCategories');
        this.buttonIncomes = document.getElementById('buttonIncomes');
        this.buttonExpenses = document.getElementById('buttonExpenses');
        this.subMenu = document.getElementById('collapse');

        const regEx = /[#\/]([a-z-]+)[^?]*/gi;
        regEx.exec(location.hash)?.forEach(token => {
            this.location = (Object.values(LocationType).find(location => location === token)) as string;
        });
        this.balanceElement = document.getElementById('user-balance');
        Balance.getBalance()
            .then(balance => {
                if (this.balanceElement) this.balanceElement.innerText = balance + '$';
            });

        const userName: UserInfoType | null = Auth.getUserInfo();
        if (userName && this.userNameElement) {
            this.userNameElement.innerText = `${userName.firstName} ${userName.lastName}`;
        }

        if (this.buttonMain) this.buttonMain.classList.add('active');

        const that: Sidebar = this;

        if (this.buttonMain) {
            this.buttonMain.onclick = function () {
                if (!that.buttonCategories?.classList.contains('collapsed'))
                    that.buttonCategories?.dispatchEvent(new Event('click'));
                that.makeInactive();
                that.buttonMain?.classList.add('active');
            }
        }

        if (this.buttonBalance) {
            this.buttonBalance.onclick = function () {
                if (!that.buttonCategories?.classList.contains('collapsed'))
                    that.buttonCategories?.dispatchEvent(new Event('click'));
                that.makeInactive();
                that.buttonBalance?.classList.add('active');
            }
        }

        if (this.buttonIncomes) {
            this.buttonIncomes.onclick = function () {
                that.makeInactive();
                that.buttonCategories?.classList.add('active');
                that.buttonIncomes?.parentElement?.classList.add('active');
            }
        }

        if (this.buttonExpenses) {
            this.buttonExpenses.onclick = function () {
                that.makeInactive();
                that.buttonCategories?.classList.add('active');
                that.buttonExpenses?.parentElement?.classList.add('active');
            }
        }

        if (this.buttonCategories) {
            this.buttonCategories.onclick = function () {
                that.buttonCategories?.classList.add('active');
                if (that.buttonMain) {
                    that.buttonMain.classList.remove('active');
                }
                if (that.buttonBalance) {
                    that.buttonBalance.classList.remove('active');
                }
                if (that.buttonCategories?.classList.contains('collapsed')) {
                    setTimeout(() => {
                        that.buttonCategories?.classList.remove('rounded-0');
                        that.buttonCategories?.classList.remove('rounded-top');
                        that.buttonCategories?.classList.add('rounded');
                    }, 200);
                }
                if (!that.buttonCategories?.classList.contains('collapsed')) {
                    that.buttonCategories?.classList.remove('rounded');
                    that.buttonCategories?.classList.add('rounded-0');
                    that.buttonCategories?.classList.add('rounded-top');
                }
            }
        }
    }

    private makeInactive(): void {
        this.buttonMain?.classList.remove('active');
        this.buttonBalance?.classList.remove('active');
        this.buttonCategories?.classList.remove('active');
        this.buttonIncomes?.parentElement?.classList.remove('active');
        this.buttonExpenses?.parentElement?.classList.remove('active');
    }
}