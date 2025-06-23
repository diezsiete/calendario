import { Task, TaskData, TaskStatus as TypeTaskStatus } from "@type/Model";
import { ActionDispatch, createContext } from "react";

export type TaskReducerCrudType = 'taskInserted'|'taskUpdated'|'taskDeleted';
export type TaskReducerActionType = 'newTaskOpened'|'editTaskOpened'|'modalClosed'|TaskReducerCrudType
export type TaskState = { task: TaskData|Task, modalShow: boolean, crudType: TaskReducerCrudType|null };
export type TaskReducerAction = {type: TaskReducerActionType, task?: Task};

export const taskDataEmpty = (): TaskData => ({name: '', description: '', status: 'todo', columnId: 'todo', position: 0});
export const taskStateClean = (): TaskState => ({ task: taskDataEmpty(), modalShow: false, crudType: null });

export const TaskContext = createContext<TaskState>(null);
export const TaskDispatch = createContext<ActionDispatch<[action: TaskReducerAction]>>(null);

export function taskReducer(state: TaskState, action: TaskReducerAction): TaskState {
    switch (action.type) {
        case "newTaskOpened": {
            return { task: taskDataEmpty(), modalShow: true, crudType: null };
        }
        case 'editTaskOpened': {
            return {  task: action.task, modalShow: true, crudType: null };
        }
        case 'modalClosed': {
            return { task: taskDataEmpty(), modalShow: false, crudType: null};
        }
        case 'taskInserted':
        case 'taskUpdated':
        case 'taskDeleted': {
            return { task: action.task,  modalShow: false, crudType: action.type };
        }
        default : {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

export const taskStatuses: Record<TypeTaskStatus, string> = {
    'backlog': 'Backlog', 'todo' : 'To Do', 'inprogress': 'In Progress', 'paused': 'Paused', 'done': 'Done'
};