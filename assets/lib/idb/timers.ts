import { Timer, TimerData } from "@type/Model";
import idb, { STORE_TIMERS } from '@lib/idb/idb';
import { add } from '@lib/idb/operation-manager';

export async function createTimer(start: number, taskId?: number): Promise<Timer> {
    const data: TimerData = { start };
    if (taskId) {
        data.taskId = taskId;
    }
    const timer = await add(STORE_TIMERS, data);
    return timer as Timer;
}
export async function updateTimer(id: number, end: number): Promise<Timer|null> {
    const db = await idb();
    const tx = db.transaction(STORE_TIMERS, 'readwrite');
    const store = tx.objectStore(STORE_TIMERS);
    const timer = await store.get(id);
    if (timer) {
        timer.end = end;
        await store.put(timer);
    }
    await tx.done;
    return timer;
}

export async function deleteTimer(timer: Timer) {
    const db = await idb();
    await db.delete(STORE_TIMERS, timer.id);
}