import { ActionDispatch, createContext, ReactNode, useReducer } from "react";

export const DbContext = createContext<string|null>(null);
export const DbDispatch = createContext<ActionDispatch<[action: string]>>(null);

export default function DbContextProvider({ children } : { children: ReactNode}) {
    const [db, dispatch] = useReducer((_, action: string) => action, null);

    return <DbContext value={db}>
        <DbDispatch value={dispatch}>{children}</DbDispatch>
    </DbContext>
}