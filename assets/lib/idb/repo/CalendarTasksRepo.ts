import { AbstractRepo } from "@lib/idb/repo/abstracts";
import { Rem } from "@lib/idb/rem";
import { DayInfo } from "@lib/calendar/WeekInfo";
import { Task } from "@type/Model";

export default class CalendarTasksRepo extends AbstractRepo {

    private calendarTasksByDay: Record<number, CalendarTask[]> = {};

    constructor(rem: Rem) {
        super('', rem)
    }

    async initWeek(startUnixSeconds: number, endUnixSeconds: number): Promise<Record<number, CalendarTask[]>> {
        return CalendarTasksRepo.singletonAsync(this, `initWeek${startUnixSeconds}${endUnixSeconds}`, async () => {
            this.calendarTasksByDay = {};

            const timers = await this.rem.timers.fetchTimersInDateRange(startUnixSeconds, endUnixSeconds);
            const tasksIds = [...new Set(timers.map(timer => timer.taskId))];
            const tasks = await this.fetchTasksByIds(tasksIds);

            for (const timer of timers) {
                const task = tasks[timer.taskId];
                const project = task?.projectId ? this.rem.projects.getProject(task.projectId) : null;
                const calendarTask = new CalendarTask(
                    timer.id, timer.taskId, task?.name ?? '', timer.start, timer.end, project?.color ?? '#c999b3'
                );
                const dayOfMonth = calendarTask.startInfo.dayOfMonth;
                this.setCalendarTaskByDay(dayOfMonth, calendarTask);
                // TODO si end abarcar mas de dos dias y si dura mas de una semana parar
                if (calendarTask.overlapsMidnight) {
                    this.setCalendarTaskByDay(calendarTask.endInfo.dayOfMonth, calendarTask);
                }
            }
            // console.log(this.calendarTasksByDay)
            return this.calendarTasksByDay;
        })
    }

    getDayTasks(dayOfMonth: number): CalendarTask[] {
        return this.calendarTasksByDay[dayOfMonth] ?? [];
    }

    private async fetchTasksByIds(tasksIds: number []): Promise<Record<number, Task>> {
        const tasks = await this.rem.tasks.fetchByIds(tasksIds);
        const tasksByIds: Record<number, Task> = {};
        for (const task of tasks) {
            tasksByIds[task.id] = task;
        }
        return tasksByIds;
    }

    private setCalendarTaskByDay(dayOfMonth: number, calendarTask: CalendarTask): void {
        if (!this.calendarTasksByDay[dayOfMonth]) {
            this.calendarTasksByDay[dayOfMonth] = [];
        }
        this.calendarTasksByDay[dayOfMonth].push(calendarTask);
    }
}

class CalendarTask {
    private _startInfo: DayInfo|null = null;
    private _endInfo: DayInfo|false = false;
    constructor(
        public readonly timerId: number,
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

    getMinuteOfDay(dayOfMonth: number): number {
        return !this.overlapsMidnight || this.startInfo.dayOfMonth == dayOfMonth
            ? this.startInfo.minuteOfDay
            : 0;
    }
    getMinutesDuration(dayOfMonth: number): number {
        if (!this.overlapsMidnight) {
            return this.endInfo.minuteOfDay - this.startInfo.minuteOfDay;
        }
        return this.startInfo.dayOfMonth == dayOfMonth
            ? 1440 - this.startInfo.minuteOfDay
            : this.endInfo.minuteOfDay;
    }
}