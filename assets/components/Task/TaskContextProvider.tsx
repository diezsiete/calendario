import { ReactNode, useEffect, useReducer, useState } from "react";
import {
    TaskModalContext,
    TaskModalDispatch,
    taskModalReducer,
    taskModalStateClean
} from "@lib/state/task-modal-state";
import {
    TaskTimerContext,
    TaskTimerDispatch,
    taskTimerReducer,
    taskTimerStateClean
} from "@lib/state/task-timer-state";
import rem from "@lib/idb/rem";

export default function TaskContextProvider({ children } : { children: ReactNode }) {
    return <TaskModalContextProvider>
        <TaskTimerContextProvider>
            {children}
        </TaskTimerContextProvider>
    </TaskModalContextProvider>
}


export function TaskModalContextProvider({ children } : { children: ReactNode }) {
    const [state, dispatch] = useReducer(taskModalReducer, taskModalStateClean());

    return (
        <TaskModalContext value={state}>
            <TaskModalDispatch value={dispatch}>
                {children}
            </TaskModalDispatch>
        </TaskModalContext>
    )
}


function TaskTimerContextProvider({ children } : { children: ReactNode }) {
    const [state, dispatch] = useReducer(taskTimerReducer, taskTimerStateClean());

    return (
        <TaskTimerContext value={state}>
            <TaskTimerDispatch value={dispatch}>
                <TaskTimerContextProviderInit>
                    {children}
                </TaskTimerContextProviderInit>
            </TaskTimerDispatch>
        </TaskTimerContext>
    )
}

function TaskTimerContextProviderInit({ children } : { children: ReactNode }) {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        rem.timers.findTimerWithoutEnd().then(async timer => {
            if (timer) {
                let localSeconds = rem.tasksTimers.local.get(timer.taskId)
                if (localSeconds !== null) {
                    localSeconds -= await rem.timers.fetchTimersTotalByTask(timer.taskId);
                    if (localSeconds >= 0) {
                        const end = timer.start + localSeconds;
                        const secondsPassed = Math.floor(Date.now() / 1000) - end;
                        if (secondsPassed > 60) {
                            console.log(`secondsPassed : ${secondsPassed} for task: ${timer.taskId} ending at ${end} : ${new Date(end * 1000).toLocaleString()}`);
                            await rem.tasksTimers.updateRunningTaskTimer(timer.taskId, timer.id, end);
                        }
                    }
                }
            }
            setInitialized(true);
        })
    }, []);

    return initialized && children;
}