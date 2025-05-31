import { IDBPDatabase } from 'idb';
import idbInit from "@lib/idb/idb-init";

const DB_NAME = 'calendario';
const DB_VERSION = 2;
export const STORE_TASKS = 'tasks';
export const STORE_TIMERS = 'timers';

export default function idb(): Promise<IDBPDatabase> {
    return idbInit(DB_NAME, DB_VERSION);
}

