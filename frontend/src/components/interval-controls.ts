import {Intervals} from "../utils/intervals";
import {Auth} from "../services/auth";

export class IntervalControls {
    periodTodayElement: HTMLElement | null = null;
    periodAllElement: HTMLElement | null = null;
    periodIntervalElement: HTMLElement | null = null;
    dateFromElement: HTMLElement | null = null;
    dateFromInputElement: HTMLInputElement | null = null;
    dateToElement: HTMLElement | null = null;
    dateToInputElement: HTMLInputElement | null = null;
    intervalApplyButton: HTMLElement | null = null;
    intervalCloseButton: HTMLElement | null = null;
    period: string | null = null;
    buttonsBlock: HTMLElement | null = null;
    datepickerElement: JQuery | null = null;
    externalContext: object;
    externalProcessFunction: Function;
    Intervals: Intervals | null = null;

    constructor(externalProcessFunction: Function, externalContext: object) {
        this.datepickerElement = jQuery('#datepicker');
        this.externalProcessFunction = externalProcessFunction;
        this.externalContext = externalContext;

        this.init();
    }

    private init(): void {
        this.periodTodayElement = document.getElementById('period-today-button');
        this.periodAllElement = document.getElementById('period-all-button');
        this.periodIntervalElement = document.getElementById('period-interval-button');
        this.dateFromElement = document.getElementById('date-from');
        this.dateFromInputElement = document.getElementById('date-from-input') as HTMLInputElement;
        this.dateToElement = document.getElementById('date-to');
        this.dateToInputElement = document.getElementById('date-to-input') as HTMLInputElement;
        this.intervalApplyButton = document.getElementById('modal-button-datepicker-apply');
        this.intervalCloseButton = document.getElementById('modal-button-datepicker-close');
        this.buttonsBlock = document.querySelector('.filter-buttons');
        this.Intervals = new Intervals();

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

        const that: IntervalControls = this;

        if (this.buttonsBlock) {
            this.buttonsBlock.onclick = function (event: MouseEvent) {
                if (event.target && (event.target as HTMLElement).hasAttribute('data-period')) {
                    that.setButtonPeriodPressedStyle(event.target as HTMLElement);
                    that.period = (event.target as HTMLElement).getAttribute('data-period');
                    if (that.Intervals && that.period) {
                        if (that.dateToElement) {
                            that.dateToElement.innerText =
                                `${that.Intervals.today.day < 10 ? '0' : ''}${that.Intervals.today.day}.` +
                                `${that.Intervals.today.month}.${that.Intervals.today.year}`;
                        }

                        if (event.target !== that.periodAllElement && that.dateFromElement) {

                            switch (that.period) {
                                case 'today':
                                    that.dateFromElement.innerText =
                                        `${that.Intervals['today'].day < 10 ? '0' : ''}${that.Intervals['today'].day}.` +
                                        `${that.Intervals['today'].month}.${that.Intervals['today'].year}`;
                                    break;
                                case 'week':
                                    that.dateFromElement.innerText =
                                        `${that.Intervals['week'].day < 10 ? '0' : ''}${that.Intervals['week'].day}.` +
                                        `${that.Intervals['week'].month}.${that.Intervals['week'].year}`;
                                    break;
                                case 'month':
                                    that.dateFromElement.innerText =
                                        `${that.Intervals['month'].day < 10 ? '0' : ''}${that.Intervals['month'].day}.` +
                                        `${that.Intervals['month'].month}.${that.Intervals['month'].year}`;
                                    break;
                                case 'year':
                                    that.dateFromElement.innerText =
                                        `${that.Intervals['year'].day < 10 ? '0' : ''}${that.Intervals['year'].day}.` +
                                        `${that.Intervals['year'].month}.${that.Intervals['year'].year}`;
                            }
                        }

                        if (event.target === that.periodAllElement &&
                            that.dateFromElement && that.Intervals.theFirstOperationDate)
                            that.dateFromElement.innerText = that.Intervals.theFirstOperationDate;
                    }
                    that.externalProcessFunction(that.externalContext);
                }
            }
        }

        if (this.periodIntervalElement) {
            this.periodIntervalElement.onclick = this.setButtonPeriodPressedStyle.bind(this, this.periodIntervalElement);
        }

        if (this.intervalCloseButton) {
            this.intervalCloseButton.onclick = function () {
                if (that.datepickerElement) {
                    that.datepickerElement.datepicker('clearDates');
                }
            }
        }

        if (this.dateFromInputElement) {
            this.dateFromInputElement.addEventListener('focusout', (event) => {
                if (that.intervalApplyButton) {
                    if (event.target && (event.target as HTMLInputElement).value === '') {
                        that.intervalApplyButton.setAttribute('disabled', 'disabled');
                        return;
                    }
                    that.intervalApplyButton.removeAttribute('disabled');
                }
            });
        }

        if (this.dateToInputElement) {
            this.dateToInputElement.addEventListener('focusout', (event) => {
                if (that.intervalApplyButton) {
                    if (event.target && (event.target as HTMLInputElement).value === '') {
                        that.intervalApplyButton.setAttribute('disabled', 'disabled');
                        return;
                    }
                    that.intervalApplyButton.removeAttribute('disabled');
                }
            });
        }

        if (this.intervalApplyButton) {
            this.intervalApplyButton.onclick = function () {
                if (that.dateFromElement && that.dateFromInputElement) {
                    that.dateFromElement.innerText = that.dateFromInputElement.value;
                }
                if (that.dateToElement && that.dateToInputElement) {
                    that.dateToElement.innerText = that.dateToInputElement.value;
                }
                if (that.datepickerElement) {
                    that.datepickerElement.datepicker('clearDates');
                }
                if (that.dateFromElement && that.dateToElement) {
                    const dateFrom: string = that.dateFromElement.innerText.split('.').reverse().join('-');
                    const dateTo: string = that.dateToElement.innerText.split('.').reverse().join('-');
                    that.period = `interval&dateFrom=${dateFrom}&dateTo=${dateTo}`;
                }

                that.externalProcessFunction(that.externalContext);
            }
        }
    }

    private setButtonPeriodPressedStyle(button: HTMLElement): void {
        const unStylizedButton: HTMLElement | null = document.querySelector('.btn-secondary');
        if (unStylizedButton) {
            unStylizedButton.classList.remove('btn-secondary');
            unStylizedButton.classList.add('btn-outline-secondary');
        }
        button.classList.remove('btn-outline-secondary');
        button.classList.add('btn-secondary');
    }
}