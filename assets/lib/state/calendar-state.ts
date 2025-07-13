import { ActionDispatch, createContext } from "react";
import WeekInfo from "@lib/calendar/WeekInfo";

type CalendarState = { weekInfo: WeekInfo|null, navigation: WeekInfo|null };

interface CalendarActions {
    weekInfoUpdated: { weekInfo: WeekInfo },
    weekNavigated: { weekInfo: WeekInfo },
}
type CalendarReducerAction = {
    [K in keyof CalendarActions]: { type: K } & CalendarActions[K]
}[keyof CalendarActions];

export const calendarStateClean = (): CalendarState => ({ weekInfo: null, navigation: null });
export const CalendarContext = createContext<CalendarState>(null);
export const CalendarDispatch = createContext<ActionDispatch<[action: CalendarReducerAction]>>(null);

export function calendarReducer(state: CalendarState, action: CalendarReducerAction): CalendarState {
    switch (action.type) {
        case "weekInfoUpdated":
            return { ...state, weekInfo: action.weekInfo };
        case "weekNavigated":
            return { ...state, navigation: action.weekInfo };
        default : {
            throw Error('Unknown action: ' + (action as any).type);
        }
    }
}