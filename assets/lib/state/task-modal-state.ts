import { ActionDispatch, createContext } from "react";
import { Task, TaskData } from "@type/Model";
import rem from "@lib/idb/rem";

type TaskModalState = { show: boolean, task: Task|TaskData, taskPrev: Task|null };

interface TaskModalActions {
    taskModalOpened: {task?: Task|TaskData}
    taskModalClosed: unknown
    taskCreated: {task: Task}
    taskUpdated: {task: Task}
    taskDeleted: {task: Task}
}
type TaskModalReducerAction = {
    [K in keyof TaskModalActions]: { type: K } & TaskModalActions[K]
}[keyof TaskModalActions];

export const taskModalStateClean = (): TaskModalState => ({ show: false, task: rem.tasks.newTask(), taskPrev: null });
export const TaskModalContext = createContext<TaskModalState>(null);
export const TaskModalDispatch = createContext<ActionDispatch<[action: TaskModalReducerAction]>>(null);

export function taskModalReducer(state: TaskModalState, action: TaskModalReducerAction): TaskModalState {
    switch (action.type) {
        case "taskModalOpened":
            return { ...state, show: true, task: action.task ?? rem.tasks.newTask() };
        case "taskModalClosed":
            return { ...state, show: false, task: rem.tasks.newTask() };
        case "taskCreated":
        case "taskDeleted":
            return { show: false, task: action.task, taskPrev: null }
        case "taskUpdated":
            return { show: false, task: action.task, taskPrev: state.task as Task }
        default : {
            throw Error('Unknown action: ' + (action as any).type);
        }
    }
}