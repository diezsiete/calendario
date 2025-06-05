import { Task, TaskData } from "@type/Model";
import { ActionDispatch, createContext } from "react";

export type TaskState = { task: TaskData|Task, show: boolean, inserted: boolean, updated: boolean, deleted: boolean };
export type TaskReducerActionType = 'newTaskOpened'|'editTaskOpened'|'modalClosed'|'taskInserted'|'taskUpdated'|'taskDeleted'|'stateCleaned'
export type TaskReducerAction = {type: TaskReducerActionType, task?: Task};

export const taskDataEmpty = (): TaskData => ({name: '', description: '', status: 'todo'});
export const taskStateClean = (): TaskState => ({ task: taskDataEmpty(), show: false, inserted: false, updated: false, deleted: false });


export const TaskContext = createContext<TaskState>(null);
export const TaskDispatch = createContext<ActionDispatch<[action: TaskReducerAction]>>(null);

export function taskReducer(state: TaskState, action: TaskReducerAction): TaskState {
    switch (action.type) {
        case "newTaskOpened": {
            return { task: taskDataEmpty(), show: true, inserted: false, updated: false, deleted: false };
        }
        case 'editTaskOpened': {
            return { task: action.task, show: true, inserted: false, updated: false, deleted: false };
        }
        case 'modalClosed': {
            return {...state, show: false, inserted: false, updated: false, deleted: false };
        }
        case 'taskInserted': {
            return {task: action.task, show: false, inserted: true, updated: false, deleted: false };
        }
        case 'taskUpdated': {
            return {task: action.task, show: false, inserted: false, updated: true, deleted: false };
        }
        case 'taskDeleted': {
            return {task: action.task, show: false, inserted: false, updated: false, deleted: true };
        }
        case 'stateCleaned': {
            return taskStateClean();
        }
        default : {
            throw Error('Unknown action: ' + action.type);
        }
    }
}