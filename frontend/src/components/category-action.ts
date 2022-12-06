import {Auth} from "../services/auth";
import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import PathConfig from "../../config/pathConfig";
import {QueryParamsType} from "../types/query-params.type";
import {ResponseDefaultType} from "../types/response-default.type";
import {ResponseCategoryType} from "../types/response-category.type";

export class CategoryAction {
    category: string = '';
    action: string = '';
    titleElement: HTMLElement | null = null;
    requestString: string = '';
    actionElement: HTMLElement | null = null;
    cancelElement: HTMLElement | null = null;
    inputElement: HTMLInputElement | null = null;
    routeParams: QueryParamsType = {};
    backToLocation: string = '';
    editableCategoryValue: string = '';

    constructor(category: string, action: string) {
        this.category = category;
        this.action = action;
        this.routeParams = UrlManager.getQueryParams();

        this.init();
    }

    private async init(): Promise<void> {
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);

        if (!accessToken) {
            location.href = '#/login';
            return;
        }

        const that: CategoryAction = this;
        this.titleElement = document.getElementById('main-title');
        this.actionElement = document.getElementById('button-action');
        this.cancelElement = document.getElementById('button-cancel');
        if (this.cancelElement) {
            this.cancelElement.onclick = function () {
                location.href = that.backToLocation;
            }
        }
        this.inputElement = document.getElementById('category-input') as HTMLInputElement;
        this.inputElement.oninput = this.validateInput.bind(this);

        if (this.category === 'income') {
            this.requestString = 'categories/income';
            this.backToLocation = '#/incomes';
        }

        if (this.category === 'expense') {
            this.requestString = 'categories/expense';
            this.backToLocation = '#/expenses';
        }

        if (this.action === 'create' && this.actionElement) {
            this.actionElement.innerText = 'Создать';
            this.actionElement.onclick = this.createCategory.bind(this);
        }

        if (this.action === 'edit' && this.actionElement) {
            this.actionElement.innerText = 'Сохранить';
            this.actionElement.onclick = this.editCategory.bind(this);
            this.inputElement.value = this.routeParams.title;
            this.editableCategoryValue = this.inputElement.value;
        }

        if (this.category === 'income' && this.action === 'create' && this.titleElement) {
            this.titleElement.innerText = 'Создание категории доходов';
        }

        if (this.category === 'income' && this.action === 'edit' && this.titleElement) {
            this.titleElement.innerText = 'Редактирование категории доходов';
        }

        if (this.category === 'expense' && this.action === 'create' && this.titleElement) {
            this.titleElement.innerText = 'Создание категории расходов';
        }

        if (this.category === 'expense' && this.action === 'edit' && this.titleElement) {
            this.titleElement.innerText = 'Редактирование категории расходов';
        }
    }

    private async createCategory(): Promise<void> {
        if (this.inputElement) {
            try {
                const result: ResponseDefaultType | ResponseCategoryType =
                    await CustomHttp.request(`${PathConfig.host}/${this.requestString}`, 'POST', {
                        title: this.inputElement.value
                    });

                if (result && (result as ResponseDefaultType).error) {
                    throw new Error((result as ResponseDefaultType).message);
                }

                if (result && (result as ResponseCategoryType).id) {
                    location.href = this.backToLocation;
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    private async editCategory(): Promise<void> {
        const id: string = this.routeParams.id;
        if (this.inputElement) {
            try {
                const result: ResponseDefaultType | ResponseCategoryType =
                    await CustomHttp.request(`${PathConfig.host}/${this.requestString}/${id}`, 'PUT', {
                        title: this.inputElement.value
                    });

                if (result && (result as ResponseDefaultType).error) {
                    throw new Error((result as ResponseDefaultType).message);
                }

                if (result && (result as ResponseCategoryType).id) {
                    location.href = this.backToLocation;
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    private validateInput(): void {
        if (this.inputElement && this.actionElement) {
            if (this.inputElement.value === '' || this.inputElement.value === this.editableCategoryValue) {
                this.actionElement.classList.add('disabled');
                return;
            }

            if (this.action === 'edit' || this.action === 'create') {
                this.actionElement.classList.remove('disabled');
            }
        }
    }
}