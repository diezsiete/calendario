import { ReactNode, useReducer } from "react";
import { TaskContext, TaskDispatch, taskReducer, taskStateClean } from "@lib/state/task";

export default function TaskContextProvider({ children } : { children: ReactNode} ) {
    const [state, dispatch] = useReducer(taskReducer, taskStateClean() );

    return (
        <TaskContext.Provider value={state}>
            <TaskDispatch value={dispatch}>
                {children}
            </TaskDispatch>
        </TaskContext.Provider>
    )
}