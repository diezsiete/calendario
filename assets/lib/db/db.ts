import { Task } from "@type/Model";
import CalendarioDb from "@lib/db/CalendarioDb";

export interface DbImplementation {
    getTasks(): Promise<Task[]>;
}

class Db {
    private implementation: DbImplementation;
    constructor() {
        this.implementation = new CalendarioDb()
    }

    getTasks(): Promise<Task[]>  {
        return this.implementation.getTasks();
    }
}

const db = new Db();

export default db;

export function getAllTasks(): Promise<Task[]> {
    return db.getTasks();
}