import { ReactNode, useContext, useEffect, useReducer, useState } from "react";
import { DbContext } from "@components/Db/DbContextProvider";
import ProjectContextProvider from "@components/Project/ProjectContextProvider";
import TaskContextProvider from "@components/Task/TaskContextProvider";
import { KanbanContext, KanbanDispatch, kanbanReducer, kanbanStateClean } from "@lib/state/kanban-state";
import { TaskModalContext } from "@lib/state/task-modal-state";
import { ProjectContext } from "@lib/state/project-state";
import rem from "@lib/idb/rem";

export default function KanbanContextProvider({ children } : { children: ReactNode } ) {
    const [state, dispatch] = useReducer(kanbanReducer, kanbanStateClean());

    return (
        <KanbanContext value={state}>
            <KanbanDispatch value={dispatch}>
                <ProjectContextProvider>
                    <KanbanTasksInit>
                        <TaskContextProvider>
                            <KanbanTaskContextConnect>
                                {children}
                            </KanbanTaskContextConnect>
                        </TaskContextProvider>
                    </KanbanTasksInit>
                </ProjectContextProvider>
            </KanbanDispatch>
        </KanbanContext>
    )
}

function KanbanTaskContextConnect({ children } : { children: ReactNode }) {
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

function KanbanTasksInit({ children } : { children: ReactNode }) {
    const kanbanDispatch = useContext(KanbanDispatch);
    const projectContext = useContext(ProjectContext);
    const dbContext = useContext(DbContext);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        rem.kanbanColumns.fetchAllByPosition().then(async columns => {
            const ids = [];
            for (const column of columns) {
                await rem.tasksTimers.fetchTasksWithCompleteTimersByColumnId(column.id, projectContext.projectId);
                ids.push(column.id);
            }
            setInitialized(true);
            kanbanDispatch({type: 'columnUpdated', columnId: ids.join()})
        })
    }, [dbContext, projectContext.projectId, kanbanDispatch]);

    return initialized && children;
}