export type TaskStatus = 'todo'|'inprogress'|'paused'|'done';
export type Task = {
    id: number;
    name: string;
    status: TaskStatus;
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