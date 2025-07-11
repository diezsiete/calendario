import { ReactNode, useContext, useEffect, useReducer, useState } from "react";
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
import taskStopwatch from "@lib/state/taskStopwatchManager";
import rem from "@lib/idb/rem";
import ProjectContextProvider from "@components/Project/ProjectContextProvider";
import DbContextProvider, { DbContext } from "@components/Db/DbContextProvider";
import { ProjectContext } from "@lib/state/project-state";

export default function TaskContextProvider({ children } : { children: ReactNode }) {
    return <TaskModalContextProvider>
        <TaskTimerContextProvider>
            {children}
        </TaskTimerContextProvider>
    </TaskModalContextProvider>
}

export function TaskGridContextProvider({ children } : { children: ReactNode }) {
    return (
        <DbContextProvider>
            <ProjectContextProvider>
                <TasksInit>
                    <TaskContextProvider>
                        {children}
                    </TaskContextProvider>
                </TasksInit>
            </ProjectContextProvider>
        </DbContextProvider>
    )
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
        taskStopwatch.handleRunningStopwatch().then(() => setInitialized(true));
    }, []);

    return initialized && children;
}

function TasksInit({ children }: { children: ReactNode }) {
    const dbContext = useContext(DbContext);
    const projectContext = useContext(ProjectContext);
    const [initialized, setInitialized] = useState(false);
    const [prevProjectId, setPrevProjectId] = useState(null);

    useEffect(() => {
        rem.tasksTimers.fetchTasksWithCompleteTimers().then(() => setInitialized(true));
    }, []);

    useEffect(() => {
        if (dbContext || projectContext.projectId || prevProjectId) {
            setPrevProjectId(projectContext.projectId);
            setInitialized(false);
            rem.tasks.fetchAllTasks(projectContext.projectId).then(() => setInitialized(true));
        }
    }, [dbContext, projectContext.projectId, prevProjectId]);

    return initialized && children;
}