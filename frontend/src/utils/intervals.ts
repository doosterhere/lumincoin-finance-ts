import {CustomHttp} from "../services/custom-http";
import PathConfig from "../../config/pathConfig";
import {IntervalsDateType} from "../types/intervals-date.type";
import {ResponseDefaultType} from "../types/response-default.type";
import {ResponseOperationType} from "../types/response-operation.type";

export class Intervals {
    operationsDates: string[];
    theFirstOperationDate: string;
    today: IntervalsDateType;
    week: IntervalsDateType;
    month: IntervalsDateType;
    year: IntervalsDateType;
    lastMonth: number;
    lastMonthYear: number;
    oneWeekAgo: Date;
    oneMonthAgo: Date;
    oneYearAgo: Date;

    constructor() {
        this.operationsDates = [];
        this.today = {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            day: new Date().getDate(),
        }
        this.theFirstOperationDate = `${this.today.day < 10 ? '0' : ''}${this.today.day}.${this.today.month}.${this.today.year}`;
        this.oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
        this.week = {
            year: this.oneWeekAgo.getFullYear(),
            month: this.oneWeekAgo.getMonth() + 1,
            day: this.oneWeekAgo.getDate()
        }
        this.lastMonth = new Date().getMonth() > 0 ? new Date().getMonth() - 1 : 11;
        this.lastMonthYear = this.lastMonth === 11 ? new Date().getFullYear() - 1 : new Date().getFullYear();
        this.oneMonthAgo = new Date(new Date().setDate(new Date().getDate() - new Date(this.lastMonthYear, this.lastMonth, 0).getDate() - 1));
        this.month = {
            year: this.oneMonthAgo.getFullYear(),
            month: this.oneMonthAgo.getMonth() + 1,
            day: this.oneMonthAgo.getDate()
        }
        this.oneYearAgo = new Date(new Date().setDate(new Date().getDate() - 365));
        this.year = {
            year: this.oneYearAgo.getFullYear(),
            month: this.oneYearAgo.getMonth() + 1,
            day: this.oneYearAgo.getDate()
        }

        this.init();
    }

    private async init(): Promise<void> {
        try {
            const result: ResponseDefaultType | ResponseOperationType[] =
                await CustomHttp.request(`${PathConfig.host}/operations?period=all`);
            if (result && (result as ResponseDefaultType).error) {
                throw new Error((result as ResponseDefaultType).message);
            }
            if (result && !(result as ResponseDefaultType).error && Object.keys(result).length) {
                (result as ResponseOperationType[]).forEach((operation: ResponseOperationType) => this.operationsDates.push(operation.date));
                this.theFirstOperationDate = this.operationsDates.sort((a: string, b: string) => {
                    return new Date(a).getTime() - new Date(b).getTime()
                })[0].split('-').reverse().join('.');
            }
        } catch (error) {
            console.log(error);
        }
    }
}