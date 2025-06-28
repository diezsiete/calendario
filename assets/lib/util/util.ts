export function match<T extends string | number, R>(value: T, cases: Record<T, R>, defaultValue?: R): R {
    return Object.prototype.hasOwnProperty.call(cases, value) ? cases[value] : (defaultValue as R);
}

export function createSingletonAsync<T>(asyncFn: () => Promise<T>) {
    let currentPromise: Promise<T> | null = null;

    return async () => {
        if (!currentPromise) {
            currentPromise = asyncFn().finally(() => {
                currentPromise = null; // Clear after completion to allow new calls
            });
        }
        return currentPromise;
    };
}