import idb, { STORE_KANBAN_COLUMNS, STORE_TASKS } from '@lib/idb/idb';
import { KanbanColumn, Task } from "@type/Model";
import { IDBPDatabase } from "idb";
import { createSingletonAsync } from "@lib/util";

const tasksByColumn: Record<string, Task[]> = {};
let tasks: Task[] = [];

export const findAllColumnsAndCacheTasks: () => Promise<KanbanColumn[]> = createSingletonAsync(async () => {
    const db = await idb();
    const columns = await findAllColumns(db);
    for (const column of columns) {
        if (tasksByColumn[column.id] === undefined) {
            const columnTasks = await findTasksByColumn(column.id, db);
            tasksByColumn[column.id] = columnTasks;
            tasks = tasks.concat(columnTasks);
        }
    }
    return columns;
})

export async function findAllColumns(db?: IDBPDatabase): Promise<KanbanColumn[]> {
    if (!db) {
        db = await idb();
    }
    return db.getAllFromIndex(STORE_KANBAN_COLUMNS, 'position', IDBKeyRange.bound(-Infinity, Infinity));
}

export async function createColumn(column: KanbanColumn): Promise<KanbanColumn> {
    await (await idb()).add(STORE_KANBAN_COLUMNS, column);
    return column;
}

export async function findTasksByColumn(columnId: string, db?: IDBPDatabase): Promise<Task[]> {
    if (!db) {
        db = await idb();
    }
    return db.getAllFromIndex(STORE_TASKS, 'columnId_position', IDBKeyRange.bound([columnId, -Infinity], [columnId, Infinity]));
}