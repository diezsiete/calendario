import { openDB } from 'idb';
import { Task, TaskData, Timer, TimerData } from "@type/Model";
import { getLocalTimer, removeLocalTimer } from "@lib/db/local-timer";

const DB_NAME = 'calendario';
const DB_VERSION = 2;
const STORE_TASKS = 'tasks';
const STORE_TIMERS = 'timers';


const tempTasks: Omit<Task, 'id'>[] = [
    {name: 'Calendario', description: 'Crear una página de calendario similar a'}
]

async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_TASKS)) {
                const store = db.createObjectStore(STORE_TASKS, { keyPath: 'id', autoIncrement: true });

                // Seed some dummy notes
                tempTasks.forEach(tempTask => {
                    store.add(tempTask);
                    console.log('added')
                });
            }
            if (!db.objectStoreNames.contains(STORE_TIMERS)) {
                db.createObjectStore(STORE_TIMERS, {
                    keyPath: 'id',
                    autoIncrement: true
                }).createIndex("taskId", "taskId", { unique: false });
            }
        },
    });
}

export async function upsertTask(task: TaskData): Promise<void>  {
    const db = await initDB();
    const tx = db.transaction(STORE_TASKS, 'readwrite');
    const store = tx.objectStore(STORE_TASKS);
    await store.put(task); // `put` will update if `note.id` exists
    await tx.done;
}

export async function addTask(task: Omit<Task, 'id'>) {
    const db = await initDB();
    await db.add(STORE_TASKS, task);
}

export async function getAllTasks(): Promise<Task[]> {
    return (await initDB()).getAll(STORE_TASKS);
}

export async function deleteTask(task: Task) {
    const db = await initDB();
    await deleteTaskTimers(task.id);
    await db.delete(STORE_TASKS, task.id);
    removeLocalTimer(task.name);
}

const taskStartedTimers: Map<string, { task: Task, timer: Timer }> = new Map;

export async function startTaskTimer(task: Task): Promise<Timer> {
    const db = await initDB();
    const timer: TimerData = { start: Math.floor(Date.now() / 1000) };
    timer.taskId = task.id;
    const id = await db.add(STORE_TIMERS, timer);
    timer.id = id as number;
    taskStartedTimers.set(task.name, { task, timer: timer as Timer });
    return timer as Timer;
}

export async function stopTaskTimer(task: Task, timerId: number): Promise<Timer|null> {
    const timer = await updateTimer(timerId, Math.floor(Date.now() / 1000));
    taskStartedTimers.delete(task.name);
    return timer;
}
export async function updateTimer(id: number, end: number): Promise<Timer|null> {
    const db = await initDB();
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

async function deleteTimer(timer: Timer) {
    const db = await initDB();
    await db.delete(STORE_TIMERS, timer.id);
}


export async function getTaskTimers(task: Task): Promise<Timer[]> {
    const db = await initDB();
    const index = db.transaction(STORE_TIMERS).store.index('taskId');
    return index.getAll(task.id);
}

export async function getCompleteTaskTimers(task: Task): Promise<Timer[]> {
    return fixIncompleteTimers(task.name, await getTaskTimers(task));
}


async function deleteTaskTimers(taskId: number) {
    const db = await initDB();
    const tx = db.transaction(STORE_TIMERS, 'readwrite');
    const index = tx.store.index('taskId');

    let cursor = await index.openCursor(IDBKeyRange.only(taskId));
    while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
    }

    await tx.done;
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
    console.log('beforeunload CALLED AND IT SHOULDNT');
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