import { ReactNode, useContext, useEffect, useReducer } from "react";
import { DbContext } from "@components/Db/DbContextProvider";
import { CalendarContext, CalendarDispatch, calendarReducer, calendarStateClean } from "@lib/state/calendar-state";
import WeekInfo from "@lib/calendar/WeekInfo";
import rem from "@lib/idb/rem";

export default function CalendarContextProvider({ children } : { children: ReactNode } ) {
    const [state, dispatch] = useReducer(calendarReducer, calendarStateClean());

    return <CalendarContext value={state}>
        <CalendarDispatch value={dispatch}>
            <CalendarStateInit>{children}</CalendarStateInit>
        </CalendarDispatch>
    </CalendarContext>
}

function CalendarStateInit({ children } : { children: ReactNode }) {
    const context = useContext(CalendarContext);
    const dbContext = useContext(DbContext);
    const dispatch = useContext(CalendarDispatch);

    useEffect(() => {
        const weekInfo = new WeekInfo();
        rem.calendarTasks.initWeek(...weekInfo.getWeekRangeSeconds())
            .then(() => dispatch({ type: 'weekInfoUpdated', weekInfo}));
    }, [dispatch, dbContext]);

    useEffect(() => {
        if (context.navigation) {
            rem.calendarTasks.initWeek(...context.navigation.getWeekRangeSeconds())
                .then(() => dispatch({ type: 'weekInfoUpdated', weekInfo: context.navigation}));
        }
    }, [context.navigation, dispatch]);

    return context.weekInfo && children;
}