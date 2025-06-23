import { IDBPDatabase, IDBPObjectStore, openDB } from "idb";
import { STORE_KANBAN_COLUMNS, STORE_TASKS, STORE_TIMERS } from "@lib/idb/idb";
import { taskStatuses } from "@lib/state/task";
import { KanbanColumn, Task } from "@type/Model";

const dbs: Record<string, IDBPDatabase> = {};
const resolving: Record<string, {resolve: (db: IDBPDatabase) => void, reject: (ev: Event) => void}> = {};
const resolveQueue: Record<string, {resolve: (db: IDBPDatabase) => void, reject: (ev: Event) => void}[]> = {};

export default function idbInit(name: string, version: number): Promise<IDBPDatabase> {
    // return openIDB(name, version);
    return new Promise((resolve, reject) => {
        const key = name + version;
        const db = dbs[key]
        if (db) {
            resolve(db);
        } else {
            let currentResolving = resolving[key];
            if (currentResolving) {
                if (typeof resolveQueue[key] === 'undefined') {
                    resolveQueue[key] = [];
                }
                resolveQueue[key].push({resolve, reject});
            } else {
                currentResolving = {resolve, reject};
                resolving[key] = currentResolving;
                openIDB(name, version)
                    .then(db => resolveIdb(key, db))
                    .catch(e => rejectIdb(key, e))
            }
        }
    });
}

export const openIDB = async (name: string, version: number) => openDB(name, version, {
    async upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains(STORE_TASKS)) {
            db.createObjectStore(STORE_TASKS, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORE_TIMERS)) {
            db.createObjectStore(STORE_TIMERS, {
                keyPath: 'id',
                autoIncrement: true
            }).createIndex("taskId", "taskId", { unique: false });
        }
        const tasksStore = transaction.objectStore(STORE_TASKS);
        if (!tasksStore.indexNames.contains('status')) {
            tasksStore.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_KANBAN_COLUMNS)) {
            const columnsStore = db.createObjectStore(STORE_KANBAN_COLUMNS, { keyPath: 'id' });
            columnsStore.createIndex('position', 'position');

            tasksStore.createIndex('columnId', 'columnId');
            tasksStore.createIndex('position', 'position');
            // Compound index for efficient queries by column and position
            tasksStore.createIndex('columnId_position', ['columnId', 'position']);
        }

        const columnStore = transaction.objectStore(STORE_KANBAN_COLUMNS);
        const countRequest = await columnStore.count();
        if (countRequest === 0) {
            const defaultColumns: KanbanColumn[] = [];
            Object.keys(taskStatuses).forEach((status, index) => {
                defaultColumns.push({id: status, title: taskStatuses[status], position: index})
            })
            for (const column of defaultColumns) {
                await columnStore.add(column);
            }
        }
        await upgradeTasksKanbanColumns(tasksStore);
    },
});

function resolveIdb(key: string, db: IDBPDatabase) {
    const currentResolving = resolving[key];
    if (currentResolving) {
        dbs[key] = db;
        currentResolving.resolve(db);
        delete resolving[key];
    }
    const currentResolveQueue = resolveQueue[key];
    if (currentResolveQueue?.length) {
        while (currentResolveQueue.length) {
            currentResolveQueue.shift().resolve(db);
        }
    }
}
function rejectIdb(key: string, ev: Event) {
    const currentResolving = resolving[key];
    if (currentResolving) {
        currentResolving.reject(ev);
        delete currentResolving[key];
    }
    const currentResolveQueue = resolveQueue[key];
    if (currentResolveQueue?.length) {
        while (currentResolveQueue.length) {
            currentResolveQueue.shift().reject(ev);
        }
    }
}

async function upgradeTasksKanbanColumns(tasksStore: IDBPObjectStore<unknown, string[], typeof STORE_TASKS, "versionchange">) {
    const tasks: Task[] = await tasksStore.getAll();
    const tasksToUpdate: Record<string, Task[]> = {};
    for (const task of tasks) {
        const taskColumnId = task.columnId;
        if (!taskColumnId) {
            task.columnId = task.status;
            if (typeof tasksToUpdate[task.columnId] === 'undefined') {
                tasksToUpdate[task.columnId] = [];
            }
            task.position = tasksToUpdate[task.columnId].length;
            tasksToUpdate[task.columnId].push(task);
        }
    }
    for (const columnId in tasksToUpdate) {
        for (let i = 0; i < tasksToUpdate[columnId].length; i++) {
            await tasksStore.put(tasksToUpdate[columnId][i]);
        }
    }
}