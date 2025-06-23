import { IDBPDatabase } from "idb";
import { DB_NAME, DB_VERSION } from "@lib/idb/idb";
import { openIDB } from "@lib/idb/idb-init";
import { AbstractRepo } from "@lib/idb/repo/abstracts";
import KanbanColumnsRepo from "@lib/idb/repo/kanban-columns";
import TasksRepo from "@lib/idb/repo/tasks";
import { SingletonAsync } from "@lib/util/promise";
import TimersRepo from "@lib/idb/repo/timers";
import TasksTimersRepo from "@lib/idb/repo/tasks-timers";
import storage from "@lib/storage";

export class Rem extends SingletonAsync {
    private db: IDBPDatabase;
    private repos: Record<string, AbstractRepo> = {}

    get dbName(): string {
        return storage.get('db', DB_NAME);
    }
    get dbVersion(): number {
        return storage.get('dbv', DB_VERSION);
    }

    get tasks(): TasksRepo {
        return this.repos['tasks'] ? this.repos['tasks'] as TasksRepo : this.repos['tasks'] = new TasksRepo(this);
    }
    get timers(): TimersRepo {
        return this.repos['timers'] ? this.repos['timers'] as TimersRepo : this.repos['timers'] = new TimersRepo(this);
    }
    get tasksTimers(): TasksTimersRepo {
        return this.repos['tasksTimers']
            ? this.repos['tasksTimers'] as TasksTimersRepo
            : this.repos['tasksTimers'] = new TasksTimersRepo(this);
    }
    get kanbanColumns(): KanbanColumnsRepo {
        return this.repos['kanbanColumns']
            ? this.repos['kanbanColumns'] as KanbanColumnsRepo
            : this.repos['kanbanColumns'] = new KanbanColumnsRepo(this);
    }

    init() {
        return Rem.singletonAsync<this>(this, 'init', async () => this.setDb())
    }

    getDb() {
        return this.db;
    }

    async setDatabase(name: string, version: number) {
        this.setDatabaseStorageValues(name, version);
        return this.setDb();
    }

    private setDatabaseStorageValues(name: string, version: number) {
        storage.set('db', name);
        storage.set('dbv', version);
    }

    private async setDb() {
        // si modificamos DB_VERSION actualizamos storage tambien
        if (this.dbVersion < DB_VERSION) {
            this.setDatabaseStorageValues(this.dbName, DB_VERSION);
        }
        this.db = await openIDB(this.dbName, this.dbVersion);
        return this;
    }
}
export default new Rem();