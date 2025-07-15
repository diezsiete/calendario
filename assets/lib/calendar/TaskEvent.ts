import DayInfo from "@lib/calendar/DayInfo";

export default class TaskEvent {
    private _startInfo: DayInfo|null = null;
    private _endInfo: DayInfo|false = false;

    constructor(
        public readonly stopwatchId: number,
        public readonly taskId: number,
        public readonly name: string,
        public readonly start: number,
        public readonly end: number|null,
        public readonly color: string,
    ) {}

    get startInfo() : DayInfo {
        return this._startInfo ? this._startInfo : this._startInfo = new DayInfo(this.start);
    }
    get endInfo() : DayInfo|null {
        return this._endInfo ? this._endInfo : this._endInfo = new DayInfo(this.end ?? Math.floor(Date.now() / 1000));
        // return this._endInfo !== false ? this._endInfo : (this._endInfo = this.end ? new DayInfo(this.end) : null);
    }

    get timestampDuration() : number {
        return this.end ? this.end - this.start : 0;
    }

    get minutesDuration() : number {
        return this.endInfo.minuteOfDay - this.startInfo.minuteOfDay;
    }

    get overlapsMidnight(): boolean {
        return this.end && this.endInfo.dayOfMonth !== this.startInfo.dayOfMonth
    }

    getMinuteOfDay(dayOfMonth: number, zoom: 1|2|4|12 = 1): number {
        return !this.overlapsMidnight || this.startInfo.dayOfMonth == dayOfMonth
            ? this.startInfo.minuteOfDay * zoom
            : 0;
    }
    getMinutesDuration(dayOfMonth: number, zoom: 1|2|4|12 = 1): number {
        if (!this.overlapsMidnight) {
            return (this.endInfo.minuteOfDay - this.startInfo.minuteOfDay) * zoom;
        }
        return this.startInfo.dayOfMonth == dayOfMonth
            ? 1440 - this.startInfo.minuteOfDay
            : this.endInfo.minuteOfDay;
    }
}