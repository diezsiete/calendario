import { ReactNode, useContext, useEffect, useReducer } from "react";
import { KanbanContext, KanbanDispatch, kanbanReducer, kanbanStateClean } from "@lib/state/kanban-state";
import ProjectContextProvider from "@components/Project/ProjectContextProvider";
import TaskContextProvider from "@components/Task/TaskContextProvider";
import { TaskModalContext } from "@lib/state/task-modal-state";

export default function KanbanContextProvider({ children } : { children: ReactNode } ) {
    const [state, dispatch] = useReducer(kanbanReducer, kanbanStateClean());

    return (
        <KanbanContext value={state}>
            <KanbanDispatch value={dispatch}>
                <ProjectContextProvider>
                    <TaskContextProvider>
                        <KanbanContextProviderInit>
                            {children}
                        </KanbanContextProviderInit>
                    </TaskContextProvider>
                </ProjectContextProvider>
            </KanbanDispatch>
        </KanbanContext>
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