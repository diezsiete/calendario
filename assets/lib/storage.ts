class Storage {
    get(name: string): string | null;
    get<T extends string | number | boolean>(name: string, defaultValue: T): T;
    get<T extends string | number | boolean>(name: string, defaultValue?: T): T | string | null {
        const value = localStorage.getItem(name);
        if (value === null) {
            return (defaultValue !== undefined ? defaultValue : null) as any;
        }
        if (defaultValue === undefined) {
            return value as any;
        }
        if (typeof defaultValue === 'number') {
            const parsed = Number(value);
            return (isNaN(parsed) ? defaultValue : parsed) as any;
        }

        if (typeof defaultValue === 'boolean') {
            // Parse boolean: "true" -> true, "false" -> false, anything else -> defaultValue
            if (value.toLowerCase() === 'true') {
                return true as any;
            } else if (value.toLowerCase() === 'false') {
                return false as any;
            } else {
                return defaultValue as any;
            }
        }

        // For string type, return the value as-is
        return value as any;
    }

    set(key: string, value: string|number|boolean) {
        localStorage.setItem(key, String(value));
    }

    remove(name: string): void {
        localStorage.removeItem(name);
    }
}

export default new Storage();