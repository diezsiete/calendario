import { IDBPCursorWithValue, IDBPDatabase, IDBPObjectStore, IDBPTransaction } from "idb";
import { SingletonAsync } from "@lib/util/promise";
import { Rem } from "@lib/idb/rem";

export type OrderBySort = 'ASC'|'DESC';

export abstract class AbstractRepo<T = any> extends SingletonAsync {
    constructor(
        public readonly store: string,
        protected readonly rem: Rem,
    ) {
        super();
    }

    find(id: number): Promise<T|undefined> {
        return this.db.get(this.store, id);
    }

    async fetchByIds(ids: number[]): Promise<T[]> {
        const tx = this.db.transaction(this.store, 'readonly');
        const store = tx.objectStore(this.store);
        // Get all tasks in parallel
        const promises = ids.map(id => store.get(id));
        const results = await Promise.all(promises);
        // Filter out undefined results (non-existent IDs)
        return results.filter(task => task !== undefined);
    }

    protected get db(): IDBPDatabase {
        return this.rem.getDb();
    }

    protected fetchAll(): Promise<T[]> {
        return this.db.getAll(this.store);
    }

    protected fetchAllByIndex(index: string, value: string|number|null): Promise<T[]> {
        return AbstractRepo.singletonAsync(this, `fetchAllByIndex${index}${value}`, () =>
            this.db.transaction(this.store).store.index(index).getAll(value)
        )
    }
    protected fetchAllByOrderedIndex<T>(index: string): Promise<T[]> {
        return AbstractRepo.singletonAsync(this, `fetchAllByOrderedIndex${index}`, async () =>
            this.db.getAllFromIndex(this.store, index, IDBKeyRange.bound(-Infinity, Infinity))
        )
    }

    protected add(data: Partial<T>): Promise<T> {
        return AbstractRepo.singletonAsync(this, AbstractRepo.createOperationObjectKey('add', data), async () => {
            const id = await this.db.add(this.store, data)
            return {id, ...data} as T;
        })
    }

    protected update(id: number|T, data: Partial<T>) {
        return this.writeTransaction<T>(async ({ store }) => {
            let record = typeof id === 'number' ? await store.get(id) as T : id;
            if (record) {
                record = {...record} as T;
                for (const key in data) {
                    if (data[key] !== undefined) {
                        record[key] = data[key];
                    }
                }
                await store.put(record);
            }
            return record;
        })
    }

    protected writeTransaction<T = void>(
        asyncFn: (props: {store: IDBPObjectStore<unknown, [string], string, 'readwrite'>, tx: IDBPTransaction<unknown, [string], 'readwrite'>}) => Promise<T>
    ): Promise<T> {
        return AbstractRepo.singletonAsync(this, `storeTransactionReadwrite`, async () => {
            const tx = this.db.transaction(this.store, 'readwrite');
            const store = tx.objectStore(this.store);
            const resp = await asyncFn({store, tx})
            await tx.done;
            return resp;
        })
    }

    protected iterateIndexCursor<T = undefined>(mode: IDBTransactionMode, indexName: string, indexValue: any, asyncFn: (cursor: IDBPCursorWithValue<unknown, [string], string, string, IDBTransactionMode>, prev: T) => Promise<T>, direction?: IDBCursorDirection) {
        return AbstractRepo.singletonAsync(this, `iterateIndexCursor${mode}${indexName}${indexValue}`, async () => {
            const tx = this.db.transaction(this.store, mode);
            const index = tx.store.index(indexName);

            let prev: T|undefined = undefined;
            let cursor = await index.openCursor(IDBKeyRange.only(indexValue), direction);
            while (cursor) {
                prev = await asyncFn(cursor, prev);
                cursor = await cursor.continue();
            }

            await tx.done;
            return prev;
        })
    }

    protected delete(id: number) {
        return this.db.delete(this.store, id);
    }
}

export abstract class AbstractQuery extends SingletonAsync {
    constructor(
        protected readonly rem: Rem,
        protected readonly store: string
    ) {
        super();
    }

    protected get db(): IDBPDatabase {
        return this.rem.getDb();
    }
}