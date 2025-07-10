import { IDBPDatabase, IDBPObjectStore, IDBPTransaction, openDB } from "idb";
import { taskStatuses } from "@lib/state/task";
import { KanbanColumn, Task } from "@type/Model";
import rem from "@lib/idb/rem";

export const openIDB = async (name: string, version: number) => openDB(name, version, {
    async upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains(rem.tasks.store)) {
            db.createObjectStore(rem.tasks.store, { keyPath: 'id', autoIncrement: true });
        }

        upgradeTimers(db, transaction);

        const tasksStore = transaction.objectStore(rem.tasks.store);
        if (!tasksStore.indexNames.contains('status')) {
            tasksStore.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains(rem.kanbanColumns.store)) {
            const columnsStore = db.createObjectStore(rem.kanbanColumns.store, { keyPath: 'id' });
            columnsStore.createIndex('position', 'position');

            tasksStore.createIndex('columnId', 'columnId');
            tasksStore.createIndex('position', 'position');
            // Compound index for efficient queries by column and position
            tasksStore.createIndex('columnId_position', ['columnId', 'position']);
        }

        const columnStore = transaction.objectStore(rem.kanbanColumns.store);
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

        upgradeProjects(db, transaction);
    },
});

function upgradeTimers(db: IDBPDatabase, transaction: IDBPTransaction<unknown, string[], 'versionchange'>) {
    if (!db.objectStoreNames.contains(rem.timers.store)) {
        db.createObjectStore(rem.timers.store, {
            keyPath: 'id',
            autoIncrement: true
        }).createIndex("taskId", "taskId", { unique: false });
    }
    const timersStore = transaction.objectStore(rem.timers.store);
    if (!timersStore.indexNames.contains('start')) {
        timersStore.createIndex('start', 'start');
    }
    if (timersStore.indexNames.contains('end')) {
        timersStore.deleteIndex('end');
    }
}

async function upgradeTasksKanbanColumns(tasksStore: IDBPObjectStore<unknown, string[], typeof rem.tasks.store, "versionchange">) {
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

function upgradeProjects(db: IDBPDatabase, transaction: IDBPTransaction<unknown, string[], 'versionchange'>) {
    const tasksStore = transaction.objectStore(rem.tasks.store);
    if (!db.objectStoreNames.contains(rem.projects.store)) {
        db.createObjectStore(rem.projects.store, { keyPath: 'id', autoIncrement: true });
        tasksStore.createIndex('projectId', 'projectId', { unique: false });
    }
    if (!tasksStore.indexNames.contains('projectId_columnId_position')) {
        tasksStore.createIndex('projectId_columnId_position', ['projectId', 'columnId', 'position']);
    }
}