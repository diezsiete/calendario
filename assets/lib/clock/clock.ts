export default class Clock {
    private startTime: number;
    private interval: ReturnType<typeof setInterval>;
    private secondChangeListener: ((second: number) => void)|null = null;
    private startListener: ((second: number) => void)|null = null;
    private endListener: ((second: number) => void)|null = null;
    private stopScheduled = false;

    constructor(
        private duration: number = 0
    ) {}

    onSecondChange(listener: (second: number) => void): this {
        this.secondChangeListener = listener;
        return this;
    }
    onStart(listener: (second: number) => void): this {
        this.endListener = listener;
        return this;
    }
    onEnd(listener: (second: number) => void): this {
        this.endListener = listener;
        return this;
    }

    toggle(start: boolean) {
        if (start) {
            this.start();
        } else {
            this.clear();
        }
    }

    start() {
        this.startTime = Date.now() + this.duration * 1000;
        this.startListener?.(Math.floor(this.startTime / 1000));
        this.interval = setInterval(() => {
            const now = Date.now();
            let elapsedTime = this.duration
                ? Math.ceil((this.startTime - now) / 1000)
                : Math.floor((now - this.startTime) / 1000);
            if (elapsedTime < 0) {
                elapsedTime = 0;
            }
            this.secondChangeListener?.(elapsedTime);
            if (elapsedTime <= 0 || this.stopScheduled) {
                this.endListener?.(Math.floor(now / 1000));
                this.clear();
            }
        }, 1000);
    }

    clear() {
        clearInterval(this.interval);
        this.stopScheduled = false;
    }

    scheduleStop() {
        this.stopScheduled = true;
    }
}