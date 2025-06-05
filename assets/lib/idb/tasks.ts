import { getLocalTimer, removeLocalTimer } from "@lib/db/local-timer";
import idb, { STORE_TASKS, STORE_TIMERS } from '@lib/idb/idb';
import { createTimer, deleteTimer, updateTimer } from "@lib/idb/timers";
import { Task, TaskData, Timer } from "@type/Model";

const taskStartedTimers: Map<string, { task: Task, timer: Timer }> = new Map;

export async function getAllTasks(): Promise<Task[]> {
    return (await idb()).getAll(STORE_TASKS);
}

export async function getAllTasksWithCompleteTimers(): Promise<Task[]> {
    const tasks = await getAllTasks();
    for (const task of tasks) {
        if (task.status === 'inprogress') {
            await fixIncompleteTimers(task.name, await getTaskTimers(task));
        }
    }
    return tasks
}

export async function getTaskById(id: number): Promise<Task|undefined> {
    const db = await idb();
    return db.get(STORE_TASKS, id);
}


export async function upsertTask(task: TaskData): Promise<void>  {
    const db = await idb();
    const tx = db.transaction(STORE_TASKS, 'readwrite');
    const store = tx.objectStore(STORE_TASKS);
    await store.put(task); // `put` will update if `note.id` exists
    await tx.done;
}
export async function updateTask(task: Task, data?: Partial<TaskData>): Promise<Task|undefined>  {
    const db = await idb();
    const tx = db.transaction(STORE_TASKS, 'readwrite');
    const store = tx.objectStore(STORE_TASKS);
    const id = await store.put(data ? {...task, ...data} : task);
    task = await store.get(id);
    await tx.done;
    return task;
}

export async function addTask(data: TaskData): Promise<Task|undefined> {
    const db = await idb();
    const id = await db.add(STORE_TASKS, data);
    return db.get(STORE_TASKS, id);
}

export async function deleteTask(task: Task) {
    const db = await idb();
    await deleteTaskTimers(task.id);
    await db.delete(STORE_TASKS, task.id);
    removeLocalTimer(task.name);
}

export async function startTaskTimer(task: Task, start?: number): Promise<Timer> {
    const timer = await createTimer(start ?? Math.floor(Date.now() / 1000), task.id);
    taskStartedTimers.set(task.name, { task, timer });
    return timer;
}
export async function stopTaskTimer(task: Task, timerId: number, end?: number): Promise<Timer|undefined> {
    const timer = await updateTimer(timerId, end ?? Math.floor(Date.now() / 1000));
    taskStartedTimers.delete(task.name);
    return timer;
}


async function deleteTaskTimers(taskId: number) {
    const db = await idb();
    const tx = db.transaction(STORE_TIMERS, 'readwrite');
    const index = tx.store.index('taskId');

    let cursor = await index.openCursor(IDBKeyRange.only(taskId));
    while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
    }

    await tx.done;
}

export async function getTaskTimers(task: Task): Promise<Timer[]> {
    const index = (await idb()).transaction(STORE_TIMERS).store.index('taskId');
    return index.getAll(task.id);
}

export const getTimersTotal = (timers: Timer[]): number =>
    timers.reduce((total, timer) => total + (timer.end && timer.start ? timer.end - timer.start : 0), 0);

const fixIncompleteTimers = async (name: string, timers: Timer[]): Promise<Timer[]> => {
    const fixedTimers: Timer[] = [];
    if (timers.filter(timer => !!timer.end).length) {
        for (const key in timers) {
            const timer = timers[key];
            if (timer.end) {
                fixedTimers.push(timer);
            } else {
                const localSeconds = getLocalTimer(name);
                const missingSeconds = localSeconds !== null ? localSeconds - getTimersTotal(timers) : -1;
                if (missingSeconds > 0) {
                    fixedTimers.push(await updateTimer(timer.id, timer.start + missingSeconds));
                    removeLocalTimer(name);
                } else {
                    await deleteTimer(timer);
                }
            }
        }
    }
    return fixedTimers;
}

window.addEventListener('beforeunload', async () => {
    for (const [name, taskTimer] of taskStartedTimers) {
        const localSeconds = getLocalTimer(name);
        const missingSeconds = localSeconds !== null ? localSeconds - getTimersTotal(await getTaskTimers(taskTimer.task)) : -1;
        if (missingSeconds > 0) {
            await updateTimer(taskTimer.timer.id, taskTimer.timer.start + missingSeconds);
            removeLocalTimer(name);
        } else {
            await deleteTimer(taskTimer.timer);
        }
    }
});