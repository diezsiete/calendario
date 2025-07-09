import { ActionDispatch, createContext } from "react";

export type KanbanReducerActionType = 'columnUpdated'|'taskDragged'
export type KanbanState = { columnId: string|null, dateUpd: number|null, taskDragged: {columnId: string, position: number, columnIdChanged: boolean}|null };
export type KanbanReducerAction = {type: KanbanReducerActionType, taskId?: number, columnId?: string|null, position?: number};

export const kanbanStateClean = (): KanbanState => ({ columnId: null, dateUpd: null, taskDragged: null });

export const KanbanContext = createContext<KanbanState>(null);
export const KanbanDispatch = createContext<ActionDispatch<[action: KanbanReducerAction]>>(null);

export function kanbanReducer(state: KanbanState, action: KanbanReducerAction): KanbanState {
    switch (action.type) {
        case "columnUpdated": {
            return { ...state, columnId: action.columnId, dateUpd: Date.now() };
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
        default : {
            throw Error('Unknown action: ' + action.type);
        }
    }
}