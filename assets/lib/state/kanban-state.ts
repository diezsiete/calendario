import { ActionDispatch, createContext } from "react";

export type KanbanReducerActionType = 'newTaskOpened'|'editTaskOpened'|'modalClosed'|'columnUpdated'|'taskDragged'|'taskUpdated'
export type KanbanState = { taskId: number|null, columnId: string|null, dateUpd: number|null, modalShow: boolean, taskDragged: {columnId: string, position: number, columnIdChanged: boolean}|null };
export type KanbanReducerAction = {type: KanbanReducerActionType, taskId?: number, columnId?: string|null, position?: number};

export const kanbanStateClean = (): KanbanState => ({ taskId: null, columnId: null, dateUpd: null, modalShow: false, taskDragged: null });

export const KanbanContext = createContext<KanbanState>(null);
export const KanbanDispatch = createContext<ActionDispatch<[action: KanbanReducerAction]>>(null);

export function kanbanReducer(state: KanbanState, action: KanbanReducerAction): KanbanState {
    switch (action.type) {
        case "newTaskOpened": {
            return { ...state, taskId: null, modalShow: true };
        }
        case 'editTaskOpened': {
            return {  ...state, taskId: action.taskId, modalShow: true };
        }
        case 'modalClosed': {
            return { ...state, modalShow: false };
        }
        case "columnUpdated": {
            return { ...state, modalShow: false, columnId: action.columnId, dateUpd: Date.now() };
        }
        case "taskDragged": {
            if (!action.columnId) {
                return { ...state, taskDragged: null }
            } else if (action.columnId) {
                if (!state.taskDragged) {
                    return { ...state, taskDragged: {columnId: action.columnId, position: action.position, columnIdChanged: false}};
                }
                if (!state.taskDragged.columnIdChanged && state.taskDragged.columnId !== action.columnId) {
                    return {...state, taskDragged: {...state.taskDragged, columnIdChanged: true }};
                }
            }
            return state;
        }
        case 'taskUpdated': {
            return { ...state, modalShow: false, taskId: action.taskId, dateUpd: Date.now() };
        }
        default : {
            throw Error('Unknown action: ' + action.type);
        }
    }
}