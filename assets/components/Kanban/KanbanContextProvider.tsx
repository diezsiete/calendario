import { ReactNode, useEffect, useReducer, useState } from "react";
import { KanbanContext, KanbanDispatch, kanbanReducer, kanbanStateClean } from "@lib/state/kanban-state";
import rem from "@lib/idb/rem";

export default function KanbanContextProvider({ children } : { children: ReactNode} ) {
    const [initialized, setInitialized] = useState(false);
    const [state, dispatch] = useReducer(kanbanReducer, kanbanStateClean());

    useEffect(() => {
        rem.init().then(() => setInitialized(true));
    }, []);

    return (
        <KanbanContext.Provider value={state}>
            <KanbanDispatch value={dispatch}>
                {initialized && children}
            </KanbanDispatch>
        </KanbanContext.Provider>
    )
}