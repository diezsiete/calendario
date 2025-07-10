import { ActionDispatch, createContext } from "react";
import { Task, Timer } from "@type/Model";

type TaskTimerState = { showWarning: boolean, task: Task|null, timer: Timer|null };

interface TaskTimerActions {
    warningOpened: {task: Task, timer: Timer}
}
type TaskTimerReducerAction = {
    [K in keyof TaskTimerActions]: { type: K } & TaskTimerActions[K]
}[keyof TaskTimerActions];

export const taskTimerStateClean = (): TaskTimerState => ({ showWarning: false, task: null, timer: null });
export const TaskTimerContext = createContext<TaskTimerState>(null);
export const TaskTimerDispatch = createContext<ActionDispatch<[action: TaskTimerReducerAction]>>(null);

export function taskTimerReducer(state: TaskTimerState, action: TaskTimerReducerAction): TaskTimerState {
    switch (action.type) {
        case "warningOpened":
            return { showWarning: true, task: action.task, timer: action.timer };
        default : {
            throw Error('Unknown action: ' + (action as any).type);
        }
    }
}