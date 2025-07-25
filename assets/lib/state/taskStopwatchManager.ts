import rem from "@lib/idb/rem";
import Stopwatch from "@lib/util/Stopwatch";
import { Timer } from "@type/Model";

type RunningHandler = (running: boolean, seconds: number, taskId: number) => void;
type SecondHandler = (seconds: number) => void;

class TaskStopwatchManager {

    private taskRunning: number|null = null;
    private taskStopwatch: Timer|null = null;
    private readonly stopwatch: Stopwatch;
    public readonly lastTaskRunning = new TaskStopwatchLocal('task-stopwatch-last');
    public readonly localStopwatch = new LocalStopwatch();
    private seconds: number = 0

    private runningHandlers: Map<number, RunningHandler> = new Map
    private secondHandlers: Map<number, SecondHandler> = new Map

    constructor() {
        this.stopwatch = new Stopwatch().onSecondChange(second => {
            this.seconds = second;
            this.localStopwatch.set(this.taskRunning, this.seconds);
            this.secondHandlers.get(this.taskRunning)?.(this.seconds);
            this.secondHandlers.get(0)?.(this.seconds);
        });
    }

    getTaskStopwatchTotal(taskId?: number): number {
        if (this.taskRunning && (!taskId || this.taskRunning === taskId)) {
            return this.seconds;
        }
        const task = taskId ? rem.tasks.getTask(taskId) : null;
        return task?.timersTotal ?? 0;
    }

    isRunning(taskId?: number) {
        return taskId ? this.taskRunning === taskId : !!this.taskRunning;
    }

    getLastTaskRunning(): number|null {
        return this.taskRunning ?? this.lastTaskRunning.get()
    }
    getLastTaskStopwatchTotal(): number {
        const taskId = this.getLastTaskRunning();
        return taskId ? this.getTaskStopwatchTotal(taskId) : 0;
    }

    onRunning(handler?: RunningHandler): this;
    onRunning(taskId: number, handler?: RunningHandler): this;
    onRunning(taskId: number|RunningHandler, handler?: RunningHandler): this {
        if (!taskId) {
            this.runningHandlers.delete(0);
        } else if (typeof taskId === 'function') {
            this.runningHandlers.set(0, taskId);
        } else if (handler) {
            this.runningHandlers.set(taskId, handler);
        } else {
            this.runningHandlers.delete(taskId);
        }
        return this;
    }

    onSecond(handler?: SecondHandler): this;
    onSecond(taskId: number, handler?: SecondHandler): this;
    onSecond(taskId: number|SecondHandler, handler?: SecondHandler): this {
        if (!taskId) {
            this.secondHandlers.delete(0);
        } else if (typeof taskId === 'function') {
            this.secondHandlers.set(0, taskId);
        } else if (handler) {
            this.secondHandlers.set(taskId, handler);
        } else {
            this.secondHandlers.delete(taskId);
        }
        return this;
    }

    toggleRunning(taskId: number) {
        if (this.taskRunning) {
            this.stopwatch.stop().then(endTimestamp => this.stopRunning(endTimestamp).then(prevTaskId => {
                if (prevTaskId !== taskId) {
                    this.startRunning(taskId);
                }
            }))
        } else {
            this.startRunning(taskId);
        }
    }

    start(taskId: number) {
        if (this.taskRunning !== taskId) {
            if (this.taskRunning) {
                this.stopwatch.stop().then(endTimestamp => this.stopRunning(endTimestamp).then(() => {
                    this.startRunning(taskId);
                }))
            } else {
                this.startRunning(taskId);
            }
        }
    }
    stop(taskId?: number) {
        if (this.taskRunning && (!taskId || this.taskRunning === taskId)) {
            this.stopwatch.stop().then(endTimestamp => this.stopRunning(endTimestamp))
        }
    }

    async handleRunningStopwatch() {
        const stopwatch = await rem.timers.findTimerWithoutEnd();
        if (stopwatch) {
            let localSeconds = this.localStopwatch.get(stopwatch.taskId);
            if (localSeconds !== null) {
                // si task no existe parar y borrar. (pasó en cambio de db)
                const task = await rem.tasks.find(stopwatch.taskId);
                if (!task) {
                    await rem.timers.deleteByTask(stopwatch.taskId);
                    this.localStopwatch.remove(stopwatch.taskId);
                    return;
                }

                localSeconds -= await rem.timers.fetchTimersTotalByTask(stopwatch.taskId);
                if (localSeconds >= 0) {
                    const end = stopwatch.start + localSeconds;
                    const secondsPassed = Math.floor(Date.now() / 1000) - end;
                    if (secondsPassed > 60) {
                        console.log(`secondsPassed : ${secondsPassed} for task: ${stopwatch.taskId} ending at ${end} : ${new Date(end * 1000).toLocaleString()}`);
                        await this.endTaskStopwatchRunning(stopwatch.taskId, stopwatch.id, end);
                    } else if (!this.taskRunning) {
                        this.startRunning(stopwatch.taskId, stopwatch);
                    }
                }
            }
        }
    }

    private startRunning(taskId: number, stopwatch?: Timer) {
        this.seconds = rem.tasks.getTask(taskId)?.timersTotal ?? 0;
        if (stopwatch) {
            this.seconds += Math.floor(Date.now() / 1000) - stopwatch.start;
            this.taskStopwatch = stopwatch
        }
        this.taskRunning = taskId;
        this.lastTaskRunning.set(taskId);

        this.localStopwatch.set(taskId, 0);

        this.runningHandlers.get(this.taskRunning)?.(true, this.seconds, this.taskRunning);
        this.runningHandlers.get(0)?.(true, this.seconds, this.taskRunning);
        const start = this.stopwatch.start(this.seconds);
        if (!stopwatch) {
            this.startTaskStopwatch(taskId, start).then(stopwatch => this.taskStopwatch = stopwatch);
        }
    }

    private async stopRunning(endTimestamp: number): Promise<number> {
        const taskId = this.taskRunning;
        this.localStopwatch.remove(taskId);
        const totalSeconds = await this.stopTaskStopwatch(taskId, this.taskStopwatch.id, endTimestamp);
        this.runningHandlers.get(taskId)?.(false, totalSeconds, taskId);
        this.taskRunning = this.taskStopwatch = null;
        this.seconds = 0;
        this.runningHandlers.get(0)?.(false, 0, taskId);
        return taskId;
    }

    private async startTaskStopwatch(taskId: number, start: number) {
        let timer = await rem.timers.findLastTaskTimerWithoutEnd(taskId);
        if (!timer) {
            timer = await rem.timers.createTimer(start ?? Math.floor(Date.now() / 1000), taskId);
        }
        return timer;
    }

    private async stopTaskStopwatch(taskId: number, timerId: number, end?: number) {
        await rem.timers.updateTimer(timerId, {end: end ?? Math.floor(Date.now() / 1000)})
        return rem.tasks.updateTaskTimersTotal(taskId);
    }

    private async endTaskStopwatchRunning(taskId: number, stopwatchId: number, end: number): Promise<void> {
        await rem.timers.updateTimer(stopwatchId, { end });
        await rem.tasks.updateTaskTimersTotal(taskId);
        this.localStopwatch.remove(taskId);
    }
}

class TaskStopwatchLocal {
    constructor(
        private readonly storeKey: string
    ) {}

    get(keyPrepend?: number|string): number|null {
        const saved = localStorage.getItem(this.getKey(keyPrepend));
        return saved ? parseInt(saved, 10) : null;
    }
    set(value: number, keyPrepend?: number|string) {
        localStorage.setItem(this.getKey(keyPrepend), value + '');
    }
    remove(keyPrepend?: number|string) {
        localStorage.removeItem(this.getKey(keyPrepend));
    }
    private getKey(keyPrepend?: number|string) {
        return this.storeKey + (keyPrepend ? keyPrepend : '');
    }
}

class LocalStopwatch {
    private readonly local = new TaskStopwatchLocal('task-stopwatch-');

    get(taskId: number): number|null {
        return this.local.get(taskId);
    }
    set(taskId: number, seconds: number) {
        return this.local.set(seconds, taskId);
    }
    remove(taskId: number) {
        this.local.remove(taskId);
    }
}

export default new TaskStopwatchManager();