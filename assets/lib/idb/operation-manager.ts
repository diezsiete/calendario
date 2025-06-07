import idb from "@lib/idb/idb";

type Operation = 'add'|'put'|'delete'|'get';
type OperationDataObject = { id?: number, [k: string]: any };

const pendingOperations: Map<string, Promise<any>> = new Map()

export async function add(storeName: string, data: OperationDataObject) {
    const operation = 'add';
    const operationKey = createOperationObjectKey(storeName, operation, data);

    // If there's already a pending operation for this key, wait for it
    if (pendingOperations.has(operationKey)) {
        console.log(`Operation ${operationKey} already pending, waiting...`);
        try {
            return await pendingOperations.get(operationKey);
        } catch (error: any) {
            // If the previous operation failed, we can try again
            console.error('Previous operation failed.', error);
        }
    }

    // Create the operation promise
    const operationPromise = new Promise((resolve, reject) => idb().then(db => {
        db.add(storeName, data)
            .then(id => db.get(storeName, id)
                .then(record => resolve(record))
                .catch(error => reject(error))
            )
            .catch(error => reject(error))
    }))

    // Store the pending operation
    pendingOperations.set(operationKey, operationPromise);

    try {
        return await operationPromise;
    } finally {
        console.log(`Operation pending ${operationKey} deleted`);
        // Clean up the pending operation
        pendingOperations.delete(operationKey);
    }
}

function createOperationObjectKey(storeName: string, operation: Operation, data: OperationDataObject) {
    // Use a combination of store, operation type, and unique identifier
    let operationKey = `${storeName}:${operation}`;
    if (data.id) {
        operationKey += `:${data.id}`
    } else {
        for (const dataKey in data) {
            const dataValue = data[dataKey];
            if (typeof dataValue !== 'object' || dataValue === null) {
                operationKey += `:${dataKey}:${String(dataValue)}`
            }
        }
    }
    return operationKey;
}