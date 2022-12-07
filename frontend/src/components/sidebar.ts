import {Auth} from "../services/auth";
import {Balance} from "./balance";
import {UserInfoType} from "../types/user-info.type";
import {LocationType} from "../types/location.type";
import {GetElementBy} from "../utils/getElementBy";

export class Sidebar {
    private balanceElement: HTMLElement | null = null;
    private userNameElement: HTMLElement | null = null;
    private buttonMain: HTMLElement | null = null;
    private buttonBalance: HTMLElement | null = null;
    private buttonCategories: HTMLElement | null = null;
    private buttonIncomes: HTMLElement | null = null;
    private buttonExpenses: HTMLElement | null = null;
    private subMenu: Element | null = null;
    private location: string = '';

    constructor() {
        this.init();
    }

    private init(): void {
        this.userNameElement = GetElementBy.id('user-name');
        this.buttonMain = GetElementBy.id('buttonMain');
        this.buttonBalance = GetElementBy.id('buttonBalance');
        this.buttonCategories = GetElementBy.id('buttonCategories');
        this.buttonIncomes = GetElementBy.id('buttonIncomes');
        this.buttonExpenses = GetElementBy.id('buttonExpenses');
        this.subMenu = GetElementBy.id('collapse');

        const regEx = /[#\/]([a-z-]+)[^?]*/gi;
        regEx.exec(location.hash)?.forEach(token => {
            this.location = (Object.values(LocationType).find(location => location === token)) as string;
        });

        switch (this.location) {
            case LocationType.main: {
                if (this.buttonMain) this.buttonMain.classList.add('active');
                break;
            }

            case LocationType.incomes:
            case LocationType.incomeEditing: {
                if (this.buttonCategories && this.buttonIncomes && this.buttonIncomes.parentElement) {
                    this.buttonCategories.dispatchEvent(new Event('click'));
                    this.buttonCategories.classList.remove('rounded');
                    this.buttonCategories.classList.add('rounded-0');
                    this.buttonCategories.classList.add('rounded-top');
                    this.buttonCategories.classList.add('active');
                    this.buttonIncomes.parentElement.classList.add('active');
                }
                break;
            }

            case LocationType.expenses:
            case LocationType.expenseEditing: {
                if (this.buttonCategories && this.buttonExpenses && this.buttonExpenses.parentElement) {
                    this.buttonCategories.dispatchEvent(new Event('click'));
                    this.buttonCategories.classList.remove('rounded');
                    this.buttonCategories.classList.add('rounded-0');
                    this.buttonCategories.classList.add('rounded-top');
                    this.buttonCategories.classList.add('active');
                    this.buttonExpenses.parentElement.classList.add('active');
                }
                break;
            }

            case LocationType.balance:
            case LocationType.balanceCreating: {
                if (this.buttonBalance) this.buttonBalance.classList.add('active');
                break;
            }
        }

        this.balanceElement = GetElementBy.id('user-balance');
        Balance.getBalance()
            .then(balance => {
                if (this.balanceElement) this.balanceElement.innerText = balance + '$';
            });

        const userName: UserInfoType | null = Auth.getUserInfo();
        if (userName && this.userNameElement) {
            this.userNameElement.innerText = `${userName.firstName} ${userName.lastName}`;
        }

        const that: Sidebar = this;

        if (this.buttonMain) {
            this.buttonMain.onclick = function () {
                if (that.buttonCategories && !that.buttonCategories.classList.contains('collapsed')) {
                    that.buttonCategories.dispatchEvent(new Event('click'));
                }

                that.makeInactive();
                that.buttonMain?.classList.add('active');
            }
        }

        if (this.buttonBalance) {
            this.buttonBalance.onclick = function () {
                if (that.buttonCategories && !that.buttonCategories.classList.contains('collapsed')) {
                    that.buttonCategories.dispatchEvent(new Event('click'));
                }

                that.makeInactive();
                that.buttonBalance?.classList.add('active');
            }
        }

        if (this.buttonIncomes) {
            this.buttonIncomes.onclick = function () {
                that.makeInactive();
                if (that.buttonCategories) {
                    that.buttonCategories.classList.add('active');
                }

                if (that.buttonIncomes && that.buttonIncomes.parentElement) {
                    that.buttonIncomes.parentElement.classList.add('active');
                }
            }
        }

        if (this.buttonExpenses) {
            this.buttonExpenses.onclick = function () {
                that.makeInactive();
                if (that.buttonCategories) {
                    that.buttonCategories.classList.add('active');
                }

                if (that.buttonExpenses && that.buttonExpenses.parentElement) {
                    that.buttonExpenses.parentElement.classList.add('active');
                }
            }
        }

        if (this.buttonCategories) {
            this.buttonCategories.onclick = function () {
                if (that.buttonCategories) {
                    that.buttonCategories.classList.add('active');
                }

                if (that.buttonMain) {
                    that.buttonMain.classList.remove('active');
                }

                if (that.buttonBalance) {
                    that.buttonBalance.classList.remove('active');
                }

                if (that.buttonCategories && that.buttonCategories.classList.contains('collapsed')) {
                    setTimeout(() => {
                        that.buttonCategories?.classList.remove('rounded-0');
                        that.buttonCategories?.classList.remove('rounded-top');
                        that.buttonCategories?.classList.add('rounded');
                    }, 200);
                }

                if (that.buttonCategories && !that.buttonCategories.classList.contains('collapsed')) {
                    that.buttonCategories.classList.remove('rounded');
                    that.buttonCategories.classList.add('rounded-0');
                    that.buttonCategories.classList.add('rounded-top');
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