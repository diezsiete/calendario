export default class TimerWorker {
    private worker: Worker;
    private secondChangeListener: ((second: number) => void)|null = null;
    private endListener: ((name: string) => void)|null = null;

    constructor() {
        this.worker = new Worker(new URL("timer-worker.js", import.meta.url));
        // console.log('%cTimerWorker', 'color: #FE5D26', 'constructed');

        this.worker.onmessage = (e) => this.onmessageHandler(e);
    }

    startTimer(name: string, duration: number) {
        this.worker.postMessage({ type: 'start', name, duration });
    }
    stopTimer() {
        this.worker.postMessage({ type: 'stop' });
    }

    terminate() {
        this.worker.terminate();
        // console.log('%cTimerWorker', 'color: #FE5D26', 'worker terminated');
    }

    onSecondChange(listener: (second: number) => void): this {
        this.secondChangeListener = listener;
        return this;
    }
    onEnd(listener: (name: string) => void): this {
        this.endListener = listener;
        return this;
    }

    private onmessageHandler(e: MessageEvent) {
        // console.log('%cTimerWorker', 'color: #FE5D26', `message ${e.data.type} received`, e.data);
        switch (e.data.type) {
            case 'second':
                this.secondChangeListener?.(e.data.second);
                break;
            case 'end':
                this.endListener?.(e.data.name);
                break;
        }
    }
}