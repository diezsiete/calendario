import { AbstractRepo } from "@lib/idb/repo/abstracts";
import { Timer, TimerData } from "@type/Model";

export default class TimersRepo extends AbstractRepo<Timer> {

    fetchAllByTask(taskId: number) {
        return this.fetchAllByIndex('taskId', taskId);
    }
    async fetchTimersTotalByTask(taskId: number) {
        const timers = await this.fetchAllByTask(taskId);
        return this.sumTimers(timers);
    }

    findLastTaskTimerWithoutEnd(taskId: number): Promise<Timer|undefined> {
        return this.iterateIndexCursor<Timer>('readwrite', 'taskId', taskId, async (cursor, timer) => {
            if (!cursor.value.end) {
                if (!timer) {
                    return cursor.value as Timer;
                } else {
                    await cursor.delete();
                }
            }
            return timer;
        }, 'prev');
    }

    findTimerWithoutEnd(): Promise<Timer|undefined> {
        return TimersRepo.singletonAsync<Timer|undefined>(this, `findTimerWithoutEnd`, async () => {
            const tx = this.db.transaction(this.store, 'readonly');
            const store = tx.objectStore(this.store);

            let firstNullRecord: Timer|undefined = undefined;
            let cursor = await store.openCursor();
            while (cursor) {
                if (cursor.value.end === null) {
                    firstNullRecord = cursor.value as Timer;
                    break;
                }
                cursor = await cursor.continue();
            }
            await tx.done;
            return firstNullRecord;
        })
    }

    fetchTimersInDateRange(startUnixSeconds: number, endUnixSeconds: number): Promise<Timer[]> {
        return this.db.getAllFromIndex(this.store, 'start', IDBKeyRange.bound(startUnixSeconds, endUnixSeconds))
    }

    createTimer(start: number, taskId?: number) {
        const data: TimerData = { start, end: null };
        if (taskId) {
            data.taskId = taskId;
        }
        return this.add(data);
    }

    updateTimer(timer: Timer|number, data: Partial<Timer>) {
        return this.update(timer, data);
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
}