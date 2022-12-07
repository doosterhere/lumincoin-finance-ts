import {Auth} from "./services/auth";
import {Main} from "./components/main";
import {Balance} from "./components/balance";
import {BalanceAction} from "./components/balance-action";
import {Category} from "./components/category";
import {CategoryAction} from "./components/category-action";
import {SignIn} from "./components/sign-in";
import {Sidebar} from "./components/sidebar";
import {RouteType} from "./types/route.type";
import {GetElementBy} from "./utils/getElementBy";

export class Router {
    private readonly sidebarElement: HTMLElement | null;
    private readonly contentElement: HTMLElement | null;
    private routes: RouteType[];

    constructor() {
        this.sidebarElement = GetElementBy.id('sidebar');
        this.contentElement = GetElementBy.id('content');

        this.routes = [
            {
                route: '#/main',
                template: 'templates/main.html',
                sidebar: true,
                load: () => {
                    new Main();
                }
            },
            {
                route: '#/balance',
                template: 'templates/balance.html',
                sidebar: true,
                load: () => {
                    new Balance();
                }
            },
            {
                route: '#/balance-creating',
                template: 'templates/balance-action.html',
                sidebar: true,
                load: () => {
                    new BalanceAction('create');
                }
            },
            {
                route: '#/balance-editing',
                template: 'templates/balance-action.html',
                sidebar: true,
                load: () => {
                    new BalanceAction('edit');
                }
            },
            {
                route: '#/incomes',
                template: 'templates/category.html',
                sidebar: true,
                load: () => {
                    new Category('incomes');
                }
            },
            {
                route: '#/expenses',
                template: 'templates/category.html',
                sidebar: true,
                load: () => {
                    new Category('expenses');
                }
            },
            {
                route: '#/income-editing',
                template: 'templates/category-action.html',
                sidebar: true,
                load: () => {
                    new CategoryAction('income', 'edit');
                }
            },
            {
                route: '#/expense-editing',
                template: 'templates/category-action.html',
                sidebar: true,
                load: () => {
                    new CategoryAction('expense', 'edit');
                }
            },
            {
                route: '#/income-creating',
                template: 'templates/category-action.html',
                sidebar: true,
                load: () => {
                    new CategoryAction('income', 'create');
                }
            },
            {
                route: '#/expense-creating',
                template: 'templates/category-action.html',
                sidebar: true,
                load: () => {
                    new CategoryAction('expense', 'create');
                }
            },
            {
                route: '#/login',
                template: 'templates/login.html',
                sidebar: false,
                load: () => {
                    new SignIn('login');
                }
            },
            {
                route: '#/signup',
                template: 'templates/sign-up.html',
                sidebar: false,
                load: () => {
                    new SignIn('signup');
                }
            },
        ];
    }

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];

        if (urlRoute === '#/logout') {
            await Auth.logout();
            location.href = '#/login';
            return;
        }

        const newRoute: RouteType | undefined = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/login';
            return;
        }

        if (newRoute.sidebar && this.sidebarElement && !GetElementBy.class('sidebar')) {
            const sidebarTemplate = 'templates/sidebar.html';
            if (this.sidebarElement) {
                this.sidebarElement.innerHTML = await fetch(sidebarTemplate).then(response => response.text());
            }
            new Sidebar();
        }

        if (!newRoute.sidebar && this.sidebarElement && this.sidebarElement.innerHTML) {
            this.sidebarElement.removeChild(this.sidebarElement.childNodes[0]);
        }

        if (this.contentElement) {
            this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        }

        newRoute.load();
    }
}