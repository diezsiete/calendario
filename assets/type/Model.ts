import { DBSchema } from 'idb';

export type Task = {
    id: number;
    name: string;
    description?: string;
}
export type TaskData = Omit<Task, 'id'> & {id?: number};

export type Timer = {
    id: number;
    start: number;
    end?: number;
    taskId?: number;
}
export type TimerData = Omit<Timer, 'id'> & {id?: number};


export interface CalendarioIDB extends DBSchema {
    'tasks': {
        key: number;
        value: Task;
    };
    timers: {
        value: Timer;
        key: number;
        indexes: { 'taskId': number };
    };
}