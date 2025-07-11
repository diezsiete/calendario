import { AbstractRepo } from "@lib/idb/repo/abstracts";
import rem, { Rem } from "@lib/idb/rem";
import { Task } from "@type/Model";

export default class TasksTimersRepo extends AbstractRepo {
    public readonly local: LocalTimer;

    constructor(rem: Rem) {
        super('', rem)
        this.local = new LocalTimer();
    }

    fetchTasksWithCompleteTimers(): Promise<Task[]> {
        return this.completeTasksTimers(() => this.rem.tasks.fetchAllTasks());
    }

    fetchTasksWithCompleteTimersByColumnId(columnId: string, projectId?: number|null): Promise<Task[]> {
        return this.completeTasksTimers(() => this.rem.tasks.fetchAllByColumnId(columnId, projectId));
    }

    async updateRunningTaskTimer(taskId: number, timerId: number, end: number): Promise<void> {
        await rem.timers.updateTimer(timerId, { end });
        await rem.tasks.updateTaskTimersTotal(taskId)
        this.local.remove(taskId);
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