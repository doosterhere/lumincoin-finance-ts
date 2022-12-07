import {Intervals} from "../utils/intervals";
import {GetElementBy} from "../utils/getElementBy";

export class IntervalControls {
    public periodTodayElement: HTMLElement | null = null;
    private periodAllElement: HTMLElement | null = null;
    private periodIntervalElement: HTMLElement | null = null;
    private dateFromElement: HTMLElement | null = null;
    private dateFromInputElement: HTMLInputElement | null = null;
    private dateToElement: HTMLElement | null = null;
    private dateToInputElement: HTMLInputElement | null = null;
    private intervalApplyButton: HTMLElement | null = null;
    private intervalCloseButton: HTMLElement | null = null;
    public period: string | null = null;
    private buttonsBlock: HTMLElement | null = null;
    private readonly datepickerElement: JQuery | null = null;
    private externalContext: object;
    private externalProcessFunction: Function;
    private Intervals: Intervals | null = null;

    constructor(externalProcessFunction: Function, externalContext: object) {
        this.datepickerElement = jQuery('#datepicker');
        this.externalProcessFunction = externalProcessFunction;
        this.externalContext = externalContext;

        this.init();
    }

    private init(): void {
        this.periodTodayElement = GetElementBy.id('period-today-button');
        this.periodAllElement = GetElementBy.id('period-all-button');
        this.periodIntervalElement = GetElementBy.id('period-interval-button');
        this.dateFromElement = GetElementBy.id('date-from');
        this.dateFromInputElement = GetElementBy.id('date-from-input') as HTMLInputElement;
        this.dateToElement = GetElementBy.id('date-to');
        this.dateToInputElement = GetElementBy.id('date-to-input') as HTMLInputElement;
        this.intervalApplyButton = GetElementBy.id('modal-button-datepicker-apply');
        this.intervalCloseButton = GetElementBy.id('modal-button-datepicker-close');
        this.buttonsBlock = GetElementBy.class('filter-buttons');
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

                if (that.intervalApplyButton) {
                    that.intervalApplyButton.setAttribute('disabled', 'disabled');
                }
            }
        }

        if (this.dateFromInputElement) {
            this.dateFromInputElement.addEventListener('focusout', (event) => {
                this.setIntervalApplyButtonAvailability(event.target as HTMLInputElement);
            });
        }

        if (this.dateToInputElement) {
            this.dateToInputElement.addEventListener('focusout', (event) => {
                this.setIntervalApplyButtonAvailability(event.target as HTMLInputElement);
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

    private setIntervalApplyButtonAvailability(element: HTMLInputElement): void {
        if (this.intervalApplyButton) {
            if (element && (element as HTMLInputElement).value === '') {
                this.intervalApplyButton.setAttribute('disabled', 'disabled');
                return;
            }

            this.intervalApplyButton.removeAttribute('disabled');
        }
    }
}