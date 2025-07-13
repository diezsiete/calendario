import { AbstractRepo } from "@lib/idb/repo/abstracts";
import rem, { Rem } from "@lib/idb/rem";
import TaskEvent from "@lib/calendar/TaskEvent";
import { Task } from "@type/Model";

export default class CalendarTasksRepo extends AbstractRepo {

    private taskEventsByDay: Record<number, TaskEvent[]> = {};

    constructor(rem: Rem) {
        super('', rem)
    }

    async initWeek(startUnixSeconds: number, endUnixSeconds: number): Promise<Record<number, TaskEvent[]>> {
        return CalendarTasksRepo.singletonAsync(this, `initWeek${startUnixSeconds}${endUnixSeconds}`, async () => {
            this.taskEventsByDay = {};

            const timers = await this.rem.timers.fetchTimersInDateRange(startUnixSeconds, endUnixSeconds);
            const tasksIds = [...new Set(timers.map(timer => timer.taskId))];
            const tasks = await this.fetchTasksByIds(tasksIds);

            for (const timer of timers) {
                const task = tasks[timer.taskId];
                const project = task?.projectId ? this.rem.projects.getProject(task.projectId) : null;
                const taskEvent = new TaskEvent(
                    timer.id, timer.taskId, task?.name ?? '', timer.start, timer.end, project?.color ?? '#c999b3'
                );
                const dayOfMonth = taskEvent.startInfo.dayOfMonth;
                this.setCalendarTaskByDay(dayOfMonth, taskEvent);
                // TODO si end abarcar mas de dos dias y si dura mas de una semana parar
                if (taskEvent.overlapsMidnight) {
                    this.setCalendarTaskByDay(taskEvent.endInfo.dayOfMonth, taskEvent);
                }
            }
            // console.log(this.calendarTasksByDay)
            return this.taskEventsByDay;
        })
    }

    getDayTasks(dayOfMonth: number): TaskEvent[] {
        return this.taskEventsByDay[dayOfMonth] ?? [];
    }

    async removeDayTask(taskEventRemove: TaskEvent): Promise<void> {
        const dayOfMonth = taskEventRemove.startInfo.dayOfMonth;
        await rem.timers.deleteTimer(taskEventRemove.stopwatchId);
        this.taskEventsByDay[dayOfMonth] = this.taskEventsByDay[dayOfMonth]
            .filter(taskEvent => taskEvent.stopwatchId !== taskEventRemove.stopwatchId);
    }

    private async fetchTasksByIds(tasksIds: number []): Promise<Record<number, Task>> {
        const tasks = await this.rem.tasks.fetchByIds(tasksIds);
        const tasksByIds: Record<number, Task> = {};
        for (const task of tasks) {
            tasksByIds[task.id] = task;
        }
        return tasksByIds;
    }

    private setCalendarTaskByDay(dayOfMonth: number, taskEvent: TaskEvent): void {
        if (!this.taskEventsByDay[dayOfMonth]) {
            this.taskEventsByDay[dayOfMonth] = [];
        }
        this.taskEventsByDay[dayOfMonth].push(taskEvent);
    }
}