import ChartConfig from "../../config/chartConfig";
import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import pathConfig from "../../config/pathConfig";
import {IntervalControls} from "./interval-controls";
import Chart, {ChartConfiguration, ChartItem} from "chart.js/auto";
import {ResponseOperationType} from "../types/response-operation.type";
import {ResponseDefaultType} from "../types/response-default.type";
import {GetElementBy} from "../utils/getElementBy";

export class Main {
    private myChartIncomeElement: ChartItem | null = null;
    private myChartExpenseElement: ChartItem | null = null;
    private incomesChart: Chart | null = null;
    private expensesChart: Chart | null = null;
    private incomesConfig: ChartConfiguration = structuredClone(ChartConfig) as ChartConfiguration;
    private expensesConfig: ChartConfiguration = structuredClone(ChartConfig) as ChartConfiguration;
    private IntervalControls: IntervalControls | null = null;
    private periodTodayElement: HTMLElement | null = null;

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);

        if (!accessToken) {
            location.href = '#/login';
            return;
        }

        this.periodTodayElement = GetElementBy.id('period-today-button');

        this.myChartIncomeElement = GetElementBy.id('chart-incomes') as ChartItem;
        this.myChartExpenseElement = GetElementBy.id('chart-expenses') as ChartItem;

        this.IntervalControls = new IntervalControls(this.processOperation, this);

        this.incomesChart = new Chart(this.myChartIncomeElement, this.incomesConfig);
        this.expensesChart = new Chart(this.myChartExpenseElement, this.expensesConfig);

        if (this.periodTodayElement) {
            this.periodTodayElement.dispatchEvent(new Event('click', {bubbles: true}));
        }
    }

    private async processOperation(context: this): Promise<void> {
        context.incomesConfig = structuredClone(ChartConfig) as ChartConfiguration;
        context.expensesConfig = structuredClone(ChartConfig) as ChartConfiguration;
        context.expensesConfig.data.datasets[0].backgroundColor =
            Array.from(ChartConfig.data.datasets[0].backgroundColor).reverse();
        context.incomesConfig.data.datasets[0].label = 'Доходы';
        context.expensesConfig.data.datasets[0].label = 'Расходы';

        if (context.incomesChart) context.incomesChart.destroy();

        if (context.expensesChart) context.expensesChart.destroy();

        try {
            const result: ResponseOperationType[] | ResponseDefaultType = context.IntervalControls ?
                await CustomHttp.request(`${pathConfig.host}/operations?period=${context.IntervalControls.period}`) : null;
            if ((result as ResponseDefaultType).error) {
                throw new Error((result as ResponseDefaultType).message);
            }

            if (result && !(result as ResponseDefaultType).error) {
                (result as ResponseOperationType[]).forEach((operation: ResponseOperationType) => {
                    let currentConfig: ChartConfiguration = ChartConfig as ChartConfiguration;

                    if (operation.type === 'income') currentConfig = context.incomesConfig;

                    if (operation.type === 'expense') currentConfig = context.expensesConfig;

                    if (currentConfig.data.labels && !currentConfig.data.labels.some((label: string | unknown) => (label === operation.category))) {
                        if (operation.category) {
                            (currentConfig.data.labels as string[]).push(operation.category);

                            const index: number = operation.category ? (currentConfig.data.labels as string[]).indexOf(operation.category)
                                : (currentConfig.data.labels as string[]).indexOf('удалённые категории');

                            (currentConfig.data.datasets[0].data as number[])[index] = 0;
                        }

                        if (!operation.category && !currentConfig.data.labels.some(label => label === 'удалённые категории')) {
                            (currentConfig.data.labels as string[]).push('удалённые категории');

                            const index: number = operation.category ? (currentConfig.data.labels as string[]).indexOf(operation.category)
                                : (currentConfig.data.labels as string[]).indexOf('удалённые категории');

                            (currentConfig.data.datasets[0].data as number[])[index] = 0;
                        }
                    }

                    if (currentConfig) {
                        const index: number = operation.category ? (currentConfig.data.labels as string[]).indexOf(operation.category)
                            : (currentConfig.data.labels as string[]).indexOf('удалённые категории');
                        (currentConfig.data.datasets[0].data as number[])[index] += operation.amount;
                    }
                });

                if (context.myChartIncomeElement && context.myChartExpenseElement) {
                    context.incomesChart = new Chart(context.myChartIncomeElement, context.incomesConfig as ChartConfiguration);
                    context.expensesChart = new Chart(context.myChartExpenseElement, context.expensesConfig as ChartConfiguration);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}