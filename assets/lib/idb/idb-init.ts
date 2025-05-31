import  {IDBPDatabase, openDB } from "idb";
import { STORE_TASKS, STORE_TIMERS } from "@lib/idb/idb";

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
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_TASKS)) {
            db.createObjectStore(STORE_TASKS, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORE_TIMERS)) {
            db.createObjectStore(STORE_TIMERS, {
                keyPath: 'id',
                autoIncrement: true
            }).createIndex("taskId", "taskId", { unique: false });
        }
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