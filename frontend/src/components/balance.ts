import {CustomHttp} from "../services/custom-http";
import pathConfig from "../../config/pathConfig";
import {Auth} from "../services/auth";
import {Category} from "./category";
import {IntervalControls} from "./interval-controls";
import {ResponseDefaultType} from "../types/response-default.type";
import {ResponseBalanceType} from "../types/response-balance.type";
import {ResponseOperationType} from "../types/response-operation.type";
import {ResponseCategoryType} from "../types/response-category.type";
import {GetElementBy} from "../utils/getElementBy";

export class Balance {
    private balanceElement: HTMLElement | null = null;
    private createIncomeElement: HTMLElement | null = null;
    private createExpenseElement: HTMLElement | null = null;
    private dataTableElement: HTMLElement | null = null;
    private modalButtonDelete: HTMLElement | null = null;
    private readonly categoriesCount: { incomeCount: number, expenseCount: number } | undefined;
    private IntervalControls: IntervalControls | undefined;

    constructor() {
        this.categoriesCount = {
            incomeCount: 0,
            expenseCount: 0
        };

        this.init();
    }

    private async init(): Promise<void> {
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);

        if (!accessToken) {
            location.href = '#/login';
            return;
        }

        this.createIncomeElement = GetElementBy.id('button-create-income');
        this.createExpenseElement = GetElementBy.id('button-create-expense');
        this.balanceElement = GetElementBy.id('user-balance');
        this.dataTableElement = GetElementBy.id('data-table');
        this.modalButtonDelete = GetElementBy.id('modal-button-delete-confirm');

        this.IntervalControls = new IntervalControls(this.processOperation, this);

        await Category.getCategories('categories/income')
            .then((result: ResponseCategoryType[]) => {
                if (this.categoriesCount) {
                    this.categoriesCount.incomeCount = result.length;
                }
            });

        await Category.getCategories('categories/expense')
            .then((result: ResponseCategoryType[]) => {
                if (this.categoriesCount) {
                    this.categoriesCount.expenseCount = result.length;
                }
            });

        if (this.categoriesCount && !this.categoriesCount.incomeCount && this.createIncomeElement) {
            this.createIncomeElement.setAttribute('disabled', 'disabled');
        }

        if (this.categoriesCount && !this.categoriesCount.expenseCount && this.createExpenseElement) {
            this.createExpenseElement.setAttribute('disabled', 'disabled');
        }

        const that: Balance = this;

        if (this.dataTableElement) {
            this.dataTableElement.onclick = function (event: MouseEvent) {
                const target: HTMLElement | null = (event.target as HTMLElement).parentElement;

                if (target && target.classList.contains('delete-operation-button') && that.modalButtonDelete) {
                    that.modalButtonDelete.setAttribute('data-id', target.getAttribute('data-id') as string);
                }
            }
        }

        if (this.modalButtonDelete) {
            this.modalButtonDelete.onclick = this.deleteOperation.bind(this);
        }

        if (this.createIncomeElement) {
            this.createIncomeElement.onclick = function () {
                location.href = '#/balance-creating?type=income';
            }
        }

        if (this.createExpenseElement) {
            this.createExpenseElement.onclick = function () {
                location.href = '#/balance-creating?type=expense';
            }
        }

        if (this.IntervalControls.periodTodayElement) {
            this.IntervalControls.periodTodayElement.dispatchEvent(new Event('click', {bubbles: true}));
        }
    }

    private async processOperation(context: this): Promise<void> {
        if (context.dataTableElement) {
            context.dataTableElement.innerHTML = '';
        }

        try {
            const result: ResponseOperationType[] | ResponseDefaultType = context.IntervalControls ?
                await CustomHttp.request(`${pathConfig.host}/operations?period=${context.IntervalControls.period}`) : null;
            if (result && (result as ResponseDefaultType).error) throw new Error((result as ResponseDefaultType).message);
            if (result && !(result as ResponseDefaultType).error) {
                (result as ResponseOperationType[]).forEach((operation: ResponseOperationType, index: number) => {
                    const operationData = document.createElement('div');
                    operationData.classList.add('row', 'align-items-center', 'border-bottom', 'border-1', 'border-secondary', 'border-opacity-75');
                    const operationNumber = document.createElement('div');
                    operationNumber.classList.add('col-2', 'text-center', 'fw-bold');
                    operationNumber.innerText = (index + 1).toString();
                    const operationType = document.createElement('div');
                    const operationColorByType = operation.type === 'income' ? 'text-success' : operation.type === 'expense' ? 'text-danger' : 'text-secondary';
                    operationType.classList.add('col-1', 'text-center', operationColorByType);
                    operationType.innerText = operation.type === 'income' ? 'доход' : 'расход';
                    const operationCategory = document.createElement('div');
                    operationCategory.classList.add('col-2', 'text-center');
                    operationCategory.innerText = operation.category ? operation.category : '—';
                    const operationAmount = document.createElement('div');
                    operationAmount.classList.add('col-1', 'text-center');
                    operationAmount.innerText = operation.amount.toString();
                    const operationDate = document.createElement('div');
                    operationDate.classList.add('col-2', 'text-center');
                    operationDate.innerText = operation.date.split('-').reverse().join('.');
                    const operationComment = document.createElement('div');
                    operationComment.classList.add('col-3', 'text-center');
                    operationComment.innerText = operation.comment;

                    const operationButtonBlock = document.createElement('div');
                    operationButtonBlock.classList.add('col-1', 'text-end', 'pe-0');
                    const operationDeleteLink = document.createElement('a');
                    operationDeleteLink.href = "javascript:void(0)";
                    operationDeleteLink.classList.add('text-decoration-none', 'me-2', 'delete-operation-button');
                    operationDeleteLink.setAttribute('data-bs-toggle', 'modal');
                    operationDeleteLink.setAttribute('data-bs-target', '#confirm-delete-window');
                    operationDeleteLink.setAttribute('data-id', operation.id.toString());
                    const operationDeleteLinkImage = document.createElement('img');
                    operationDeleteLinkImage.src = 'images/trash-icon.png';
                    operationDeleteLinkImage.alt = 'delete';
                    operationDeleteLink.appendChild(operationDeleteLinkImage);
                    const operationEditLink = document.createElement('a');
                    operationEditLink.href = `#/balance-editing?id=${operation.id}`;
                    operationEditLink.classList.add('text-decoration-none', 'edit-operation-button');
                    const operationEditLinkImage = document.createElement('img');
                    operationEditLinkImage.src = 'images/pen-icon.png';
                    operationEditLinkImage.alt = 'edit';
                    operationEditLink.appendChild(operationEditLinkImage);
                    operationButtonBlock.appendChild(operationDeleteLink);
                    operationButtonBlock.appendChild(operationEditLink);

                    operationData.appendChild(operationNumber);
                    operationData.appendChild(operationType);
                    operationData.appendChild(operationCategory);
                    operationData.appendChild(operationAmount);
                    operationData.appendChild(operationDate);
                    operationData.appendChild(operationComment);
                    operationData.appendChild(operationButtonBlock);

                    if (context.dataTableElement) {
                        context.dataTableElement.appendChild(operationData);
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    public static async getBalance(): Promise<number> {
        try {
            const result: ResponseDefaultType | ResponseBalanceType =
                await CustomHttp.request(`${pathConfig.host}/balance`);
            if (result && !(result as ResponseDefaultType).error) return (result as ResponseBalanceType).balance;
            if ((result as ResponseDefaultType).error) throw new Error((result as ResponseDefaultType).message);
        } catch (error) {
            console.log(error);
        }
        return -Infinity;
    }

    private async deleteOperation(): Promise<void> {
        if (this.modalButtonDelete) {
            const id: string | null = this.modalButtonDelete.getAttribute('data-id');

            try {
                const result: ResponseDefaultType = await CustomHttp.request(`${pathConfig.host}/operations/${id}`, 'DELETE');
                if (result && !result.error) {
                    await this.processOperation(this);
                    Balance.getBalance()
                        .then((balance: number) => {
                            if (this.balanceElement) {
                                this.balanceElement.innerText = balance + '$';
                            }
                        });
                    console.log(result.message);
                    return;
                }
                if (result.error) throw new Error(result.message);
            } catch (error) {
                console.log(error);
            }
        }
    }
}