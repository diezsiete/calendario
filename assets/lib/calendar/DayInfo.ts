import { ucfirst } from "@lib/util/varchar";

export default class DayInfo {
    private _date: Date|undefined;
    private readonly timestamp: number|null = null;
    private readonly locale: string;

    constructor(date?: Date|number, locale: string = 'en-US') {
        if (typeof date === 'number') {
            this.timestamp = date;
        } else {
            this._date = date;
        }
        this.locale = locale;
    }

    get date(): Date {
        return this._date ? this._date : this._date = new Date(this.timestamp ? this.timestamp  * 1000 : Date.now());
    }

    get name(): string {
        return this.date.toLocaleDateString(this.locale, { weekday: 'short' });
    }
    get dayOfMonth(): number {
        return this.date.getDate();
    }
    get unixSeconds(): number {
        return Math.floor(this.date.getTime() / 1000)
    }
    get minuteOfDay(): number {
        return this.date.getHours() * 60 + this.date.getMinutes()
    }
    get isToday(): boolean {
        const today = new Date();
        return this.date.getFullYear() === today.getFullYear() &&
            this.date.getMonth() === today.getMonth() &&
            this.date.getDate() === today.getDate();
    }
    get Ymd(): string {
        return this.date.toLocaleDateString('en-CA');
    }
    get rangeText(): string {
        return this.dayOfMonth + ' ' + ucfirst(this.date.toLocaleString(this.locale, { month: 'short' })) + ' ' + this.Ymd.slice(0, 4)
    }

    clone(): DayInfo {
        return new DayInfo(new Date(this.date), this.locale);
    }
    setDate(date: number): DayInfo {
        this.date.setDate(date);
        return this;
    }

    formatTime({hour = '2-digit', minute = '2-digit', hour12 = false, second}: Intl.DateTimeFormatOptions = {}) {
        return this.date.toLocaleTimeString('en-US', {
            hour,
            minute,
            second,
            hour12
        });
    }
}