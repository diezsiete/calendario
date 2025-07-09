import { ReactNode, useContext, useEffect, useReducer } from "react";
import KbContextProvider from "@components/Kanban/KanbanContextProvider";
import { TaskModalContext, TaskModalDispatch, taskModalReducer, taskModalStateClean } from "@lib/state/task-modal-state";
import { KanbanDispatch } from "@lib/state/kanban-state";

export function KanbanContextProvider({ children } : { children: ReactNode }) {
    return <KbContextProvider>
        <TaskModalContextProvider>
            <KanbanContextProviderInit>
                {children}
            </KanbanContextProviderInit>
        </TaskModalContextProvider>
    </KbContextProvider>
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

function KanbanContextProviderInit({ children } : { children: ReactNode }) {
    const taskModalState = useContext(TaskModalContext);
    const kanbanDispatch = useContext(KanbanDispatch);

    useEffect(() => {
        if (!taskModalState.show && taskModalState.task.id) {
            if (taskModalState.taskPrev) {
                const columnId = taskModalState.task.columnId + (taskModalState.task.columnId !== taskModalState.taskPrev.columnId ? `,${taskModalState.taskPrev.columnId}` : '');
                kanbanDispatch({type: 'columnUpdated', columnId: columnId})
            } else {
                kanbanDispatch({type: 'columnUpdated', columnId: taskModalState.task.columnId})
            }
        }
    }, [taskModalState, kanbanDispatch]);

    return children;
}