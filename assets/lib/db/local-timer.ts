import { toSlug } from "@lib/util/varchar";

export function getAllLocalTimers(): Record<string, number> {
    const localTimers = {};
    const keys = Object.keys(localStorage).filter(k => k.startsWith('timer-'));
    for (const key of keys) {
        const name = key.replace(/^timer-/, '');
        localTimers[name] = getLocalTimer(name);
    }
    return localTimers;
}

export function getLocalTimer(name: string): number|null {
    const saved = localStorage.getItem(getSlug(name));
    return saved ? parseInt(saved, 10) : null;
}

export function setLocalTimer(name: string, seconds: number) {
    localStorage.setItem(getSlug(name), seconds + '');
}

const getSlug = (name: string) => 'timer-' + toSlug(name);