import { DbImplementation } from "@lib/db/db";
import { Task } from "@type/Model";
// import { v4 as uuid } from "uuid";

type UpgradeneededHandler = (event: IDBVersionChangeEvent, resolve: (db: IDBDatabase) => void, reject: (e: Event) => void) => void;

const tempTasks: Omit<Task, 'id'>[] = [
    {/*id: '923728e8-04cd-4cfd-97e7-62eddfb55439', */name: 'Calendario', description: 'Crear una página de calendario similar a'}
]


export default class CalendarioDb implements DbImplementation {

    private name: string = 'calendario';
    private version: number = 1;

    getTasks(): Promise<Task[]> {
        return new Promise(resolve => {
            // this.open().then(db => this.getAllTasks(db, resolve));

            open(this.name, this.version, (event, oResolve, oRejecct) => this.upgradeNeededAutoIncrementHandler(event, oResolve, oRejecct))
                .then(db => {
                    this.getAllTasks(db, resolve);
                    // this.cursorAllTasks(db, resolve);
                })
        })
    }

    private getAllTasks(db, resolve) {
        db.transaction("tasks").objectStore("tasks").getAll().onsuccess = (event) => {
            resolve((event.target as IDBRequest).result);
            // const tasks = (event.target as IDBRequest).result as Task[];
            // resolve(tasks.reduce((taskUuid: Record<string, Task>, task: Task) => {
            //     taskUuid[task.id] = task;
            //     return taskUuid;
            // }, {}))
        };
    }

    private cursorAllTasks(db, resolve) {
        const tasks: Record<string, Task> = {};
        console.log('%cCalendarioDb %ccursorAllTasks', 'color: #82f575', 'color: deeppink');
        db.transaction("tasks").objectStore("tasks").openCursor().onsuccess = (event) => {
            const cursor = event.target.result as IDBCursorWithValue;
            if (cursor) {
                const task = cursor.value;
                // task.id = cursor.key;
                tasks[task.id] = task;
                cursor.continue();
            } else {
                resolve(tasks);
            }
        };
    }

    private open(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);

            request.onsuccess = (event: Event) => {
                console.log('%cCalendarioDb', 'color: #82f575', 'open.onsuccess', event)
                // store the result of opening the database in the db variable. This is used a lot below
                resolve(request.result);
            };

            request.onerror = (ev: Event) => {
                console.error('%cCalendarioDb', 'color: #82f575', 'open.error', ev);
                reject(ev)
            };

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => this.upgradeNeededKeyPathHandler(event, resolve, reject);
        });
    }

    private upgradeNeededKeyPathHandler(
        event: IDBVersionChangeEvent, resolve: (db: IDBDatabase) => void, reject: (e: Event) => void
    ) {
        console.log('%cCalendarioDb %copen.onupgradeneeded(keyPath)', 'color: #82f575', 'color: #ffb409');
        const db = (event.target as IDBOpenDBRequest).result;

        // Create an objectStore to hold information about our task. We're
        // going to use "id" as our key path because it's guaranteed to be unique.
        const objectStore = db.createObjectStore("tasks", { keyPath: "id" });

        // Create an index to search tasks by name. We may have duplicates
        // so we can't use a unique index.
        objectStore.createIndex("name", "name", { unique: false });

        // Use transaction oncomplete to make sure the objectStore creation is
        // finished before adding data into it.
        objectStore.transaction.oncomplete = () => {
            console.log('%cCalendarioDb %copen.onupgradeneeded(keyPath)', 'color: #82f575', 'color: #ffb409', 'oncomplete');
            // Store values in the newly created objectStore.
            const transaction = db.transaction("tasks", "readwrite");
            transaction.oncomplete = (event: Event) => {
                console.log('%cCalendarioDb %copen.onupgradeneeded(keyPath)', 'color: #82f575', 'color: #ffb409', 'transaction.oncomplete', event);
                resolve(db);
            };

            transaction.onerror = (event: Event) => {
                console.error('%cCalendarioDb %copen.onupgradeneeded(keyPath)', 'color: #82f575', 'color: #ffb409', 'transaction.error', event);
                reject(event);
            };
            const tasksObjectStore = transaction.objectStore("tasks");
            tempTasks.forEach(tempTask => {
                tasksObjectStore.add(tempTask);
            });
        };
    }

    private upgradeNeededAutoIncrementHandler(
        event: IDBVersionChangeEvent, resolve: (db: IDBDatabase) => void, reject: (e: Event) => void
    ) {
        console.log('%cCalendarioDb %copen.onupgradeneeded(autoIncrement)', 'color: #82f575', 'color: #ae6bf3');
        const db = (event.target as IDBOpenDBRequest).result;

        const objectStore = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });

        // Create an index to search tasks by name. We may have duplicates
        // so we can't use a unique index.
        objectStore.createIndex("name", "name", { unique: false });

        // Use transaction oncomplete to make sure the objectStore creation is
        // finished before adding data into it.
        objectStore.transaction.oncomplete = () => {
            console.log('%cCalendarioDb %copen.onupgradeneeded(autoIncrement)', 'color: #82f575', 'color: #ae6bf3', 'oncomplete');
            // Store values in the newly created objectStore.
            const transaction = db.transaction("tasks", "readwrite");
            transaction.oncomplete = (event: Event) => {
                console.log('%cCalendarioDb %copen.onupgradeneeded(autoIncrement)', 'color: #82f575', 'color: #ae6bf3', 'transaction.oncomplete', event);
                resolve(db);
            };

            transaction.onerror = (event: Event) => {
                console.error('%cCalendarioDb %copen.onupgradeneeded(autoIncrement)', 'color: #82f575', 'color: #ae6bf3', 'transaction.error', event);
                reject(event);
            };
            const tasksObjectStore = transaction.objectStore("tasks");
            tempTasks.forEach(tempTask => {
                tasksObjectStore.add(tempTask);
                console.log('added')
            });
        };
    }
}

const dbs: Record<string, IDBDatabase> = {};
const resolving: Record<string, {resolve: (db: IDBDatabase) => void, reject: (ev: Event) => void}> = {};
const resolveQueue: Record<string, {resolve: (db: IDBDatabase) => void, reject: (ev: Event) => void}[]> = {};
function open(name: string, version: number, upgradeneededHandler?: UpgradeneededHandler): Promise<IDBDatabase> {
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


                const request = indexedDB.open(name, version);

                request.onsuccess = (event: Event) => {
                    console.log('%cCalendarioDb', 'color: #82f575', 'open.onsuccess', event)
                    // store the result of opening the database in the db variable. This is used a lot below
                    openResolve(key, request.result);
                };

                request.onerror = (ev: Event) => {
                    console.error('%cCalendarioDb', 'color: #82f575', 'open.error', ev);
                    openReject(key, ev)
                };

                request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                    upgradeneededHandler?.(event, (db) => openResolve(key, db), (ev) => openReject(key, ev))
                };

            }
        }
    })
}

function openResolve(key: string, db: IDBDatabase) {
    const currentResolving = resolving[key];
    if (currentResolving) {
        currentResolving.resolve(db);
        delete currentResolving[key];
    }
    const currentResolveQueue = resolveQueue[key];
    if (currentResolveQueue?.length) {
        while (currentResolveQueue.length) {
            currentResolveQueue.shift().resolve(db);
        }
    }
}
function openReject(key: string, ev: Event) {
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
