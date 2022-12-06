import {Auth} from "../services/auth";
import PathConfig from "../../config/pathConfig"
import {CustomHttp} from "../services/custom-http";
import {ResponseCategoryType} from "../types/response-category.type";
import {ResponseDefaultType} from "../types/response-default.type";

export class Category {
    categories: ResponseCategoryType[] | null = null;
    page: string = '';
    title: HTMLElement | null = null;
    requestString: string = '';
    categoriesBlock: HTMLElement | null = null;
    addCategoryElement: HTMLElement | null = null;
    modalButtonDelete: HTMLElement | null = null;
    modalHeaderSpan: HTMLElement | null = null;
    categoryType: string = '';

    constructor(category: string) {
        this.page = category;

        this.init();
    }

    private async init(): Promise<void> {
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);

        if (!accessToken) {
            location.href = '#/login';
            return;
        }

        const that: Category = this;
        this.title = document.getElementById('main-title');
        this.categoriesBlock = document.getElementById('categories');
        this.modalHeaderSpan = document.querySelector('.modal-header span');
        this.modalButtonDelete = document.getElementById('modal-button-delete');
        if (this.modalButtonDelete) {
            this.modalButtonDelete.onclick = function () {
                that.deleteCategory.call(that);
            }
        }

        if (this.page === 'incomes') {
            this.categoryType = 'Доходы';
            if (this.title) {
                this.title.innerText = this.categoryType;
            }
            this.requestString = 'categories/income';
            if (this.modalHeaderSpan) {
                this.modalHeaderSpan.innerText = this.categoryType.toLowerCase();
            }
        }
        if (this.page === 'expenses') {
            this.categoryType = 'Расходы';
            if (this.title) {
                this.title.innerText = this.categoryType;
            }
            this.requestString = 'categories/expense';
            if (this.modalHeaderSpan) {
                this.modalHeaderSpan.innerText = this.categoryType.toLowerCase();
            }
        }

        await this.processCategories();
    }

    public static async getCategories(urlParam: string): Promise<ResponseCategoryType[]> {
        try {
            const result: ResponseCategoryType[] = await CustomHttp.request(`${PathConfig.host}/${urlParam}`);
            if (result) return result;
        } catch (error) {
            console.log(error);
        }
        return [];
    }

    private async processCategories(): Promise<void> {
        await Category.getCategories(this.requestString).then((result: ResponseCategoryType[]) => this.categories = result);
        if (this.categoriesBlock) this.categoriesBlock.innerHTML = '';
        if (this.categories && Object.keys(this.categories).length && this.categoriesBlock) {
            this.categories.forEach((card: ResponseCategoryType) => {
                const categoryElement: HTMLElement = document.createElement('div');
                categoryElement.classList.add('p-3', 'rounded-3', 'border', 'border-1', 'border-secondary', 'border-opacity-50');

                const categoryHeaderElement: HTMLElement = document.createElement('h4');
                categoryHeaderElement.classList.add('mb-3');
                categoryHeaderElement.innerText = card.title;

                const categoryEditButton: HTMLButtonElement = document.createElement('button');
                categoryEditButton.classList.add('btn', 'btn-primary', 'me-2', 'button-edit');
                categoryEditButton.innerText = 'Редактировать';
                categoryEditButton.setAttribute('data-id', `${card.id}`);

                const categoryDeleteButton: HTMLButtonElement = document.createElement('button');
                categoryDeleteButton.classList.add('btn', 'btn-danger', 'button-delete');
                categoryDeleteButton.innerText = 'Удалить';
                categoryDeleteButton.setAttribute('data-bs-toggle', 'modal');
                categoryDeleteButton.setAttribute('data-bs-target', '#modal-window');
                categoryDeleteButton.setAttribute('data-id', `${card.id}`);

                categoryElement.appendChild(categoryHeaderElement);
                categoryElement.appendChild(categoryEditButton);
                categoryElement.appendChild(categoryDeleteButton);
                if (this.categoriesBlock) {
                    this.categoriesBlock.appendChild(categoryElement);
                }
            });

            const that: Category = this;
            this.categoriesBlock.onclick = function (event: MouseEvent) {
                let target: EventTarget | null = event.target;
                const id: string | null = (target as HTMLElement).getAttribute('data-id');

                if ((target as HTMLElement).innerText === 'Редактировать') {
                    const title: string = (((target as HTMLElement).previousElementSibling) as HTMLElement).innerText;
                    if (title) {
                        location.href = `#/${that.page.slice(0, -1)}-editing?id=${id}&title=${title}`;
                    }
                    return;
                }

                if ((target as HTMLElement).innerText === 'Удалить') {
                    that.modalButtonDelete?.setAttribute('data-id', id as string);
                }
            }
        }

        this.processAddCategoryElement();
    }

    private processAddCategoryElement(): void {
        if (this.categoriesBlock) {
            const addCategoryElement: HTMLElement = document.createElement('div');
            addCategoryElement.classList.add('rounded-3', 'border', 'border-1', 'border-secondary', 'border-opacity-50');
            addCategoryElement.setAttribute('id', 'add-category-block');

            const addCategoryLinkElement: HTMLAnchorElement = document.createElement('a');
            addCategoryLinkElement.href = this.page === 'incomes' ? '#/income-creating' : '#/expense-creating';
            addCategoryLinkElement.classList.add('d-flex', 'w-100', 'h-100', 'flex-grow-1', 'align-items-center', 'justify-content-center');
            addCategoryLinkElement.setAttribute('id', 'add-category');

            const addCategoryImageElement: HTMLImageElement = document.createElement('img');
            addCategoryImageElement.setAttribute('src', 'images/+.png');

            addCategoryLinkElement.appendChild(addCategoryImageElement);
            addCategoryElement.appendChild(addCategoryLinkElement);

            this.categoriesBlock.appendChild(addCategoryElement);

            this.addCategoryElement = document.getElementById('add-category');
        }
    }

    private async deleteCategory(): Promise<void> {
        if (this.modalButtonDelete) {
            const id: string | null = this.modalButtonDelete.getAttribute('data-id');
            try {
                const result: ResponseDefaultType =
                    await CustomHttp.request(`${PathConfig.host}/${this.requestString}/${id}`, 'DELETE');
                if (result && !result.error) {
                    await this.processCategories();
                }
                if (result.error) {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}