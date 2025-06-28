export default class WeekInfo {
    public readonly days: DayInfo[] = [];
    private readonly date: Date

    get monday (): DayInfo {
        return this.days[0];
    }
    get sunday (): DayInfo {
        return this.days[6];
    }

    constructor(date?: Date, locale: string = 'en-US') {
        const baseDate = date ?? new Date();
        this.date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0 , 0, 0, 0)
        const dayOfWeek = (this.date.getDay() + 6) % 7 + 1; // 1 = Monday, 7 = Sunday
        const daysToSubstract = dayOfWeek - 1;
        let monday: Date;
        if (!daysToSubstract) {
            monday = this.date;
        } else {
            monday = new Date(new Date().setHours(0, 0, 0, 0));
            monday.setDate(this.date.getDate() - daysToSubstract)
        }
        this.days.push(new DayInfo(monday, locale));

        for (let i = 1; i <= 6; i++) {
            const day = new Date(new Date().setHours(0, 0, 0, 0));
            day.setDate(monday.getDate() + i);
            this.days.push(new DayInfo(day, locale));
        }
    }

    getWeekRangeSeconds(): [number, number] {
        const nextMonday = this.sunday.clone().setDate(this.sunday.dayOfMonth + 1);
        return [this.monday.unixSeconds, nextMonday.unixSeconds]
    }
}

export class DayInfo {
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