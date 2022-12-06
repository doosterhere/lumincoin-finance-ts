import {Auth} from "../services/auth";
import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import pathConfig from "../../config/pathConfig";
import {Balance} from "./balance";
import {QueryParamsType} from "../types/query-params.type";
import {ResponseDefaultType} from "../types/response-default.type";
import {ResponseOperationType} from "../types/response-operation.type";
import {ResponseCategoryType} from "../types/response-category.type";
import {BalanceActionFiledType} from "../types/balance-action-filed.type";
import {ResponseCategoryCreateType} from "../types/response-category-create.type";

export class BalanceAction {
    action: string = '';
    titleElementSpanAction: HTMLElement | null = null;
    titleElementSpanType: HTMLElement | null = null;
    actionElement: HTMLElement | null = null;
    cancelElement: HTMLElement | null = null;
    requestString: string = '';
    operationTypeElement: HTMLElement | null = null;
    categoryElement: HTMLElement | null = null;
    amountElement: HTMLElement | null = null;
    dateElement: HTMLElement | null = null;
    commentElement: HTMLElement | null = null;
    incomeOptionElement: HTMLElement | null = null;
    expenseOptionElement: HTMLElement | null = null;
    balanceElement: HTMLElement | null = null;
    routeParams: QueryParamsType = {};
    method: string | null = null;
    datepickerElement: JQuery | null = null;
    operationData: ResponseOperationType | null = null;
    categoriesData: ResponseCategoryType[] = [];
    fields: BalanceActionFiledType[] = [];

    constructor(action: string) {
        this.action = action;
        this.routeParams = UrlManager.getQueryParams();
        this.datepickerElement = jQuery('#date-input');

        this.fields = [
            {
                id: 'category-input-list',
                initialData: ''
            },
            {
                id: 'amount-input',
                initialData: ''
            },
            {
                id: 'date-input',
                initialData: ''
            },
            {
                id: 'comment-input',
                initialData: ''
            }
        ];

        this.init();
    }

    private async init(): Promise<void> {
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);

        if (!accessToken) {
            location.href = '#/login';
            return;
        }

        if (this.datepickerElement) {
            this.datepickerElement.datepicker({
                format: "dd.mm.yyyy",
                weekStart: 1,
                endDate: "0d",
                todayBtn: "linked",
                clearBtn: true,
                language: "ru",
                todayHighlight: true
            });
        }

        this.titleElementSpanAction = document.querySelector('#main-title span:first-child');
        this.titleElementSpanType = document.querySelector('#main-title span:last-child');
        this.actionElement = document.getElementById('button-action');
        this.cancelElement = document.getElementById('button-cancel');
        this.actionElement = document.getElementById('button-action');
        this.operationTypeElement = document.getElementById('type-input');
        this.incomeOptionElement = document.querySelector('#type-input option:nth-child(2)');
        this.expenseOptionElement = document.querySelector('#type-input option:last-child');
        this.categoryElement = document.getElementById('category-input-list');
        this.amountElement = document.getElementById('amount-input');
        this.dateElement = document.getElementById('date-input');
        this.commentElement = document.getElementById('comment-input');
        this.balanceElement = document.getElementById('user-balance');

        if (this.action === 'edit') {
            if (this.titleElementSpanAction) {
                this.titleElementSpanAction.innerText = 'Редактирование';
            }

            if (this.actionElement) {
                this.actionElement.innerText = 'Сохранить';
            }

            await this.getOperationData()
                .then((response: ResponseOperationType | void) => {
                    if (response) {
                        return this.operationData = response as ResponseOperationType;
                    }
                });

            await this.getCategoriesData()
                .then((response: ResponseCategoryType[] | void) => {
                    if (this.categoriesData) {
                        return this.categoriesData = response as ResponseCategoryType[];
                    }
                });

            this.processCategoriesList();

            if (this.operationData) {
                if (this.categoryElement) {
                    (this.categoryElement as HTMLSelectElement).value = this.operationData.category;
                }

                if (this.amountElement) {
                    (this.amountElement as HTMLInputElement).value = this.operationData.amount.toString();
                }

                if (this.dateElement) {
                    (this.dateElement as HTMLInputElement).value =
                        this.operationData.date.split('-').reverse().join('.');
                }

                if (this.commentElement) {
                    (this.commentElement as HTMLInputElement).value = this.operationData.comment;
                }

                this.requestString = `operations/${this.operationData.id}`;
                this.method = 'PUT';
            }

            if (this.categoryElement) this.categoryElement.onchange = this.validateFields.bind(this);

            this.fields.forEach(field => {
                field.initialData = (document.getElementById(field.id) as HTMLInputElement).value;
            });

            if (this.actionElement) this.actionElement.onclick = this.saveData.bind(this);
            if (this.commentElement) this.commentElement.onchange = this.validateFields.bind(this);
        }

        if (this.action === 'create') {
            const today: string = new Date().toLocaleDateString();

            if (this.datepickerElement) {
                this.datepickerElement.datepicker('update', new Date(today));
            }

            if (this.titleElementSpanAction) {
                this.titleElementSpanAction.innerText = 'Создание';
            }

            if (this.actionElement) {
                this.actionElement.innerText = 'Создать';
            }

            await this.getCategoriesData()
                .then((response: ResponseCategoryType[] | void) => {
                    if (this.categoriesData) {
                        return this.categoriesData = response as ResponseCategoryType[];
                    }
                });
            this.processCategoriesList();
            this.requestString = `operations`;
            this.method = 'POST';

            if (this.actionElement) {
                this.actionElement.onclick = this.saveData.bind(this);
            }
        }

        if (this.operationTypeElement) {
            this.operationTypeElement.setAttribute('disabled', 'disabled');
        }

        if (this.routeParams.type === 'income') {
            if (this.titleElementSpanType) {
                this.titleElementSpanType.innerText = 'дохода';
            }
            if (this.incomeOptionElement) {
                this.incomeOptionElement.setAttribute('selected', 'selected');
            }
        }

        if (this.routeParams.type === 'expense') {
            if (this.titleElementSpanType) {
                this.titleElementSpanType.innerText = 'расхода';
            }

            if (this.expenseOptionElement) {
                this.expenseOptionElement.setAttribute('selected', 'selected');
            }
        }

        if (this.cancelElement) {
            this.cancelElement.onclick = function () {
                location.href = '#/balance';
            }
        }

        if (this.amountElement) {
            this.amountElement.addEventListener('input', this.validateFields.bind(this));
        }

        if (this.dateElement) {
            this.dateElement.addEventListener('focusout', this.validateFields.bind(this));
        }
    }

    private async getOperationData(): Promise<ResponseOperationType | void> {
        if (this.routeParams.id) {
            try {
                const result: ResponseDefaultType | ResponseOperationType =
                    await CustomHttp.request(`${pathConfig.host}/operations/${this.routeParams.id}`);
                if (result && !(result as ResponseDefaultType).error) return result as ResponseOperationType;
                if ((result as ResponseDefaultType).error) throw new Error((result as ResponseDefaultType).message);
            } catch (error) {
                console.log(error);
            }
        }
    }

    private async getCategoriesData(): Promise<ResponseCategoryType[] | void> {
        const categoryType = this.operationData ? this.operationData.type : this.routeParams.type;
        if (categoryType) {
            try {
                const result: ResponseDefaultType | ResponseCategoryType[] =
                    await CustomHttp.request(`${pathConfig.host}/categories/${categoryType}`);
                if (result && !(result as ResponseDefaultType).error) return result as ResponseCategoryType[];
                if ((result as ResponseDefaultType).error) throw new Error((result as ResponseDefaultType).message);
            } catch (error) {
                console.log(error);
            }
        }
    }

    private validateFields(): void {
        if (this.actionElement) {
            if (this.categoryElement && !(this.categoryElement as HTMLSelectElement).value) {
                this.categoryElement.classList.add('border-danger');
                this.actionElement.setAttribute('disabled', 'disabled');
                return;
            }

            if (this.categoryElement) {
                this.categoryElement.classList.remove('border-danger');
            }

            if (this.amountElement && !(this.amountElement as HTMLInputElement).value) {
                this.amountElement.classList.add('border-danger');
                this.actionElement.setAttribute('disabled', 'disabled');
                return;
            }

            if (this.amountElement) {
                this.amountElement.classList.remove('border-danger');
            }

            if (this.dateElement && !(this.dateElement as HTMLInputElement).value) {
                this.dateElement.classList.add('border-danger');
                this.actionElement.setAttribute('disabled', 'disabled');
                return;
            }

            if (this.dateElement) {
                this.dateElement.classList.remove('border-danger');
            }

            if (this.action === 'edit') {
                const thereAreNoChanges: boolean =
                    this.fields.every(field =>
                        field.initialData === (document.getElementById(field.id) as HTMLInputElement).value);

                if (thereAreNoChanges) {
                    this.actionElement.setAttribute('disabled', 'disabled');
                    return;
                }
            }
            this.actionElement.removeAttribute('disabled');
        }
    }

    private processCategoriesList(): void {
        this.categoriesData.forEach((category: ResponseCategoryType) => {
            const optionElement: HTMLElement | null = document.createElement('option');

            if (optionElement) {
                (optionElement as HTMLOptionElement).value = category.title;
                optionElement.innerText = category.title;
            }

            if (this.operationData && this.operationData.category === category.title) {
                optionElement.setAttribute('selected', 'selected');

                if (this.categoryElement) {
                    this.categoryElement.setAttribute('data-initial', category.title);
                }
            }

            if (this.categoryElement) {
                this.categoryElement.appendChild(optionElement);
            }
        });
    }

    private async saveData(): Promise<void> {
        try {
            const operation: ResponseCategoryType | undefined =
                this.categoriesData.find((category: ResponseCategoryType) => {
                    return category.title === (this.categoryElement as HTMLSelectElement).value
                });

            const result: ResponseDefaultType | ResponseCategoryCreateType =
                await CustomHttp.request(`${pathConfig.host}/${this.requestString}`, this.method as string, {
                    type: this.operationData ? this.operationData.type : this.routeParams.type,
                    amount: Number((this.amountElement as HTMLInputElement).value),
                    date: (this.dateElement as HTMLInputElement).value.split('.').reverse().join('-'),
                    comment: (this.commentElement as HTMLInputElement).value === '' ? '...' : (this.commentElement as HTMLInputElement).value,
                    category_id: Number(operation?.id)
                });

            if (result && !(result as ResponseDefaultType).error) {
                Balance.getBalance()
                    .then((balance: number) => {
                        if (this.balanceElement) {
                            this.balanceElement.innerText = balance + '$';
                        }
                    });
                location.href = '#/balance';
                return;
            }

            if ((result as ResponseDefaultType).error) throw new Error((result as ResponseDefaultType).message);
        } catch (error) {
            console.log(error);
        }
    }
}