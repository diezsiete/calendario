export default class Stopwatch {
    private startTime: number;
    private interval: number;
    private secondChangeListener: ((second: number) => void)|null = null;
    private stopScheduled: false|((timestamp: number) => void) = false;

    get isRunning()  {
        return !!this.interval;
    }

    onSecondChange(listener: (second: number) => void): this {
        this.secondChangeListener = listener;
        return this;
    }

    start(initialSeconds: number = 0): number {
        this.startTime = Date.now();
        const startTimestamp = Math.floor(this.startTime / 1000);
        this.interval = setInterval(() => {
            const now = Date.now();
            const elapsedTime = Math.floor((now - this.startTime) / 1000) + initialSeconds;
            this.secondChangeListener?.(elapsedTime);
            if (this.stopScheduled) {
                const stopPromise = this.stopScheduled;
                this.clear();
                stopPromise(Math.floor(now / 1000))
            }
        }, 1000) as unknown as number;

        return startTimestamp;
    }

    stop(): Promise<number> {
        return this.isRunning
            ? new Promise(resolve => this.stopScheduled = resolve)
            : new Promise(resolve => resolve(Math.floor(Date.now() / 1000)))
    }

    clear() {
        clearInterval(this.interval);
        this.interval = 0;
        this.stopScheduled = false;
    }
}