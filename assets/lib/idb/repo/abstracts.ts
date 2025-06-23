import { IDBPCursorWithValue, IDBPDatabase, IDBPObjectStore, IDBPTransaction } from "idb";
import { SingletonAsync } from "@lib/util/promise";
import { Rem } from "@lib/idb/rem";

export type OrderBySort = 'ASC'|'DESC';

export abstract class AbstractRepo extends SingletonAsync {
    protected constructor(
        protected readonly rem: Rem,
        protected readonly store: string
    ) {
        super();
    }

    protected get db(): IDBPDatabase {
        return this.rem.getDb();
    }

    protected fetchAllByIndex<T>(index: string, value: string|number): Promise<T[]> {
        return AbstractQuery.singletonAsync(this, `fetchAllByIndex${index}${value}`, async () =>
            this.db.transaction(this.store).store.index(index).getAll(value)
        )
    }
    protected fetchAllByOrderedIndex<T>(index: string): Promise<T[]> {
        return AbstractQuery.singletonAsync(this, `fetchAllByOrderedIndex${index}`, async () =>
            this.db.getAllFromIndex(this.store, index, IDBKeyRange.bound(-Infinity, Infinity))
        )
    }

    protected add<T>(data: Partial<T>): Promise<T> {
        return AbstractQuery.singletonAsync(this, AbstractQuery.createOperationObjectKey('add', data), async () => {
            const id = await this.db.add(this.store, data)
            return {id, ...data} as T;
        })
    }

    protected update<T>(id: number|T, data: Partial<T>) {
        return this.writeTransaction<T>(async ({ store }) => {
            const record = typeof id === 'number' ? await store.get(id) as T : id;
            if (record) {
                const recordUpdated = {...record, ...data} as T;
                await store.put(recordUpdated);
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

            let prev: T|undefined;
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