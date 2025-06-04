export type TaskStatus = 'pending'|'developing'|'done';
export type Task = {
    id: number;
    name: string;
    description?: string;
    status?: TaskStatus;
}
export type TaskData = Omit<Task, 'id'> & {id?: number};

export type Timer = {
    id: number;
    start: number;
    end?: number;
    taskId?: number;
}
export type TimerData = Omit<Timer, 'id'> & {id?: number};