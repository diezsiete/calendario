export type TaskStatus = 'backlog'|'todo'|'inprogress'|'paused'|'done';
export type Task = {
    id: number;
    name: string;
    status: TaskStatus;
    description?: string;
    columnId?: string;
    position?: number;
    timersTotal?: number;
}
export type TaskData = Omit<Task, 'id'> & {id?: number};

export type Timer = {
    id: number;
    start: number;
    end?: number;
    taskId?: number;
}
export type TimerData = Omit<Timer, 'id'> & {id?: number};

// ---------------------------------------------------------------------------------------------------------------------

export type KanbanColumn = {
    id: string,
    title: string,
    position: number,
    dateUpd?: number,
};