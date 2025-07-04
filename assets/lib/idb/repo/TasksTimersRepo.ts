import { AbstractRepo } from "@lib/idb/repo/abstracts";
import rem, { Rem } from "@lib/idb/rem";
import { Task, TaskStatus, Timer } from "@type/Model";

type TaskStartedTimers = Map<number, Timer>;

export default class TasksTimersRepo extends AbstractRepo {
    public readonly local: LocalTimer;

    private taskStartedTimers: TaskStartedTimers = new Map;

    constructor(rem: Rem) {
        super('', rem)
        this.local = new LocalTimer();
    }

    async startTaskTimer(taskId: number, start?: number) {
        let timer = await rem.timers.findLastTaskTimerWithoutEnd(taskId);
        if (!timer) {
            timer = await rem.timers.createTimer(start ?? Math.floor(Date.now() / 1000), taskId);
        }
        this.taskStartedTimers.set(taskId, timer);
        return timer;
    }

    async stopTaskTimer(taskId: number, timerId: number, end?: number, status?: TaskStatus) {
        await this.rem.timers.updateTimer(timerId, {end: end ?? Math.floor(Date.now() / 1000)})
        this.taskStartedTimers.delete(taskId);
        return this.rem.tasks.updateTaskTimersTotal(taskId, status);
    }

    fetchTasksWithCompleteTimers(): Promise<Task[]> {
        return this.completeTasksTimers(() => this.rem.tasks.fetchAllTasks());
    }

    fetchTasksWithCompleteTimersByColumnId(columnId: string, projectId?: number|null): Promise<Task[]> {
        return this.completeTasksTimers(() => this.rem.tasks.fetchAllByColumnId(columnId, projectId));
    }

    getTaskStartedTimers(): TaskStartedTimers {
        return this.taskStartedTimers;
    }

    private completeTasksTimers(fetch: () => Promise<Task[]>): Promise<Task[]> {
        return TasksTimersRepo.singletonAsync(this, 'completeTasksTimers', async () => {
            const tasks = await fetch();
            for (const task of tasks) {
                if (task.status === 'inprogress') {
                    await this.completeTaskTimers(task.id)
                }
            }
            return tasks;
        })
    }

    private async completeTaskTimers(taskId: number) {
        const timers = await this.rem.timers.fetchAllByTask(taskId);
        let updateTimersTotal = false;
        if (timers.filter(timer => !!timer.end).length) {
            for (const key in timers) {
                const timer = timers[key];
                if (!timer.end) {
                    const localSeconds = this.local.get(taskId);
                    const missingSeconds = localSeconds !== null ? localSeconds - this.rem.timers.sumTimers(timers) : -1;
                    if (missingSeconds > 0) {
                        await this.rem.timers.updateTimer(timer, {end: timer.start + missingSeconds});
                        this.local.remove(taskId);
                        updateTimersTotal = true;
                    } else {
                        await this.rem.timers.deleteTimer(timer.id);
                    }
                }
            }
        }
        if (updateTimersTotal) {
            await this.rem.tasks.updateTaskTimersTotal(taskId)
        }
    }
}

class LocalTimer {
    get(taskId: number): number|null {
        const saved = localStorage.getItem(this.getSlug(taskId));
        return saved ? parseInt(saved, 10) : null;
    }
    set(taskId: number, seconds: number) {
        localStorage.setItem(this.getSlug(taskId), seconds + '');
    }
    remove(taskId: number) {
        localStorage.removeItem(this.getSlug(taskId))
    }

    private getSlug(taskId: number) {
        return `timer-task-${taskId}`;
    }
}

window.addEventListener('beforeunload', async () => {
    for (const [taskId, timer] of rem.tasksTimers.getTaskStartedTimers()) {
        const localSeconds = rem.tasksTimers.local.get(taskId);
        let missingSeconds = -1;
        if (localSeconds !== null) {
            const timersTotal = await rem.timers.fetchTimersTotalByTask(taskId);
            missingSeconds = localSeconds - timersTotal;
        }
        if (missingSeconds > 0) {
            await rem.timers.updateTimer(timer.id, {end: timer.start + missingSeconds});
            await rem.tasks.updateTaskTimersTotal(taskId, 'paused')
            rem.tasksTimers.local.remove(taskId);
        } else {
            await rem.timers.deleteTimer(timer.id);
        }
    }
});