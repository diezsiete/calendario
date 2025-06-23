export abstract class SingletonAsync {
    // Shared across all subclasses
    private static globalPromises: Map<string, Promise<any>> = new Map();

    protected static async singletonAsync<T>(
        that: any,
        operation: string,
        asyncFn: () => Promise<T>
    ): Promise<T> {
        const key = `${that.constructor.name}:${operation}`;

        if (!this.globalPromises.has(key)) {
            const promise = asyncFn().finally(() => {
                this.globalPromises.delete(key);
            });
            this.globalPromises.set(key, promise);
        }

        return this.globalPromises.get(key)!;
    }

    protected static createOperationObjectKey(operation: string, data: { [k: string|number]: any }) {
        // Use a combination of store, operation type, and unique identifier
        if (data.id) {
            operation += `:${data.id}`
        } else {
            for (const dataKey in data) {
                const dataValue = data[dataKey];
                if (typeof dataValue !== 'object' || dataValue === null) {
                    operation += `:${dataKey}:${String(dataValue)}`
                }
            }
        }
        return operation;
    }
}