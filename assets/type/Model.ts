export type ModelData<T> = Omit<T, 'id'> & {id?: number};
// ---------------------------------------------------------------------------------------------------------------------

export type TaskStatus = 'backlog'|'todo'|'inprogress'|'paused'|'done';
export type Task = {
    id: number;
    name: string;
    status: TaskStatus;
    description?: string;
    columnId?: string;
    position?: number;
    timersTotal?: number;
    projectId?: number|null;
}
export type TaskData = Omit<Task, 'id'> & {id?: number};

export type Timer = {
    id: number;
    start: number;
    end: number|null;
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

// ---------------------------------------------------------------------------------------------------------------------

export type Project = {
    id: number,
    name: string,
    color?: string,
}