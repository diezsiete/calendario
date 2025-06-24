import { AbstractRepo } from "@lib/idb/repo/abstracts";
import { Timer, TimerData } from "@type/Model";

export default class TimersRepo extends AbstractRepo {

    fetchAllByTask(taskId: number) {
        return this.fetchAllByIndex<Timer>('taskId', taskId);
    }
    async fetchTimersTotalByTask(taskId: number) {
        const timers = await this.fetchAllByTask(taskId);
        return this.sumTimers(timers);
    }

    createTimer(start: number, taskId?: number) {
        const data: TimerData = { start };
        if (taskId) {
            data.taskId = taskId;
        }
        return this.add<Timer>(data);
    }

    updateTimer(timer: Timer|number, data: Partial<Timer>) {
        return this.update<Timer>(timer, data);
    }

    deleteTimer(timerId: number) {
        return this.delete(timerId);
    }

    deleteTimersByTask(taskId: number) {
        return this.iterateIndexCursor('readwrite', 'taskId', taskId, async cursor => {
            await cursor.delete();
        })
    }

    sumTimers(timers: Timer[]): number {
        return timers.reduce((total, timer) => total + (timer.end && timer.start ? timer.end - timer.start : 0), 0);
    }

    async findLastTaskTimerWithoutEnd(taskId: number): Promise<Timer|undefined> {
        return this.iterateIndexCursor<Timer>('readwrite', 'taskId', taskId, async (cursor, timer) => {
            if (!Object.prototype.hasOwnProperty.call(cursor.value, 'end')) {
                if (!timer) {
                    return cursor.value as Timer;
                } else {
                    await cursor.delete();
                }
            }
            return timer;
        }, 'prev');
    }
}