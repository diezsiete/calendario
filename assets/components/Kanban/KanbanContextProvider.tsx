import { ReactNode, useReducer } from "react";
import { KanbanContext, KanbanDispatch, kanbanReducer, kanbanStateClean } from "@lib/state/kanban-state";
import ProjectContextProvider from "@components/Project/ProjectContextProvider";

export default function KanbanContextProvider({ children } : { children: ReactNode } ) {
    const [state, dispatch] = useReducer(kanbanReducer, kanbanStateClean());

    return (
        <KanbanContext.Provider value={state}>
            <KanbanDispatch value={dispatch}>
                <ProjectContextProvider>
                    {children}
                </ProjectContextProvider>
            </KanbanDispatch>
        </KanbanContext.Provider>
    )
}