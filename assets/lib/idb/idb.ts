import { ChangeEvent } from "react";
import { IDBPDatabase } from 'idb';
import idbInit from "@lib/idb/idb-init";

const DB_NAME = 'calendario';
const DB_VERSION = 2;
export const STORE_TASKS = 'tasks';
export const STORE_TIMERS = 'timers';

export default function idb(): Promise<IDBPDatabase> {
    return idbInit(DB_NAME, DB_VERSION);
}

export async function exportIdb() {
    const db = await idb();
    const exportData = {};

    for (const storeName of db.objectStoreNames) {
        exportData[storeName] = await db.getAll(storeName);
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${new Date().toLocaleDateString('en-CA')}-${DB_NAME}-backup.json`;
    a.click();

    URL.revokeObjectURL(url);
}

export function handleUploadRestoreFile(event: ChangeEvent) {
    const file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        const json = JSON.parse(e.target.result as any);
        await importIdb(json);
        alert('Database restored!');
        window.location.reload()
    };

    reader.readAsText(file);
}

export async function importIdb(jsonData) {
    const db = await idb();

    const tx = db.transaction(Object.keys(jsonData), 'readwrite');

    for (const storeName of Object.keys(jsonData)) {
        const store = tx.objectStore(storeName);
        for (const record of jsonData[storeName]) {
            await store.put(record); // Assumes records have keys or auto-increment
        }
    }

    await tx.done;
}