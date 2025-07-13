import DayInfo from "@lib/calendar/DayInfo";

export default class WeekInfo {
    private _days: DayInfo[] = [];
    private readonly date: Date;
    private readonly locale: string;
    private _label: string = '';

    constructor(date?: Date, locale: string = 'en-US') {
        const baseDate = date ?? new Date();
        this.date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0 , 0, 0, 0);
        this.locale = locale;
    }

    get days(): DayInfo[] {
        if (!this._days.length) {
            this._days = this.buildDays();
        }
        return this._days;
    }
    get monday (): DayInfo {
        return this.days[0];
    }
    get sunday (): DayInfo {
        return this.days[6];
    }
    get label (): string {
        if (!this._label) {
            const today = new Date();
            if (this.inDays(today)) {
                this._label = 'Esta semana'
            } else if (this.inDays(today, -7)) {
                this._label = 'Semana pasada';
            } else if (this.inDays(today, 7)) {
                this._label = 'Próxima semana';
            } else {
                this._label = this.days[0].rangeText + ' - ' + this.days[6].rangeText;
            }
        }
        return this._label;
    }

    getWeekRangeSeconds(): [number, number] {
        const nextMonday = this.sunday.clone().setDate(this.sunday.dayOfMonth + 1);
        return [this.monday.unixSeconds, nextMonday.unixSeconds]
    }

    getPrevWeek(): WeekInfo {
        return this.getOtherWeek(-7);
    }
    getNextWeek(): WeekInfo {
        return this.getOtherWeek(7);
    }

    private buildDays(): DayInfo[] {
        const dayOfWeek = (this.date.getDay() + 6) % 7 + 1; // 1 = Monday, 7 = Sunday
        const daysToSubstract = dayOfWeek - 1;
        let monday: Date;
        if (!daysToSubstract) {
            monday = this.date;
        } else {
            monday = new Date(this.date);
            monday.setDate(this.date.getDate() - daysToSubstract)
        }

        const days: DayInfo[] = [];

        days.push(new DayInfo(monday, this.locale));

        for (let i = 1; i <= 6; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            days.push(new DayInfo(day, this.locale));
        }

        return days;
    }

    private inDays(date: Date, addDays?: number) {
        if (addDays) {
            const newDate = new Date(date)
            newDate.setDate(date.getDate() + addDays);
            date = newDate;
        }
        const dateFormat = date.toLocaleDateString('en-CA');
        return this.days.reduce((inDays, day) => inDays || day.Ymd === dateFormat, false)
    }

    private getOtherWeek(addDays: number) {
        const otherWeekDate = new Date(this.date);
        otherWeekDate.setDate(this.date.getDate() + addDays);
        return new WeekInfo(otherWeekDate, this.locale);
    }
}