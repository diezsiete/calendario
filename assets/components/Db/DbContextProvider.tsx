import { ActionDispatch, createContext, ReactNode, useEffect, useReducer, useState } from "react";
import rem from "@lib/idb/rem";

export const DbContext = createContext<string|null>(null);
export const DbDispatch = createContext<ActionDispatch<[action: string]>>(null);

export default function DbContextProvider({ children } : { children: ReactNode}) {
    const [db, dispatch] = useReducer((_, action: string) => action, null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        rem.init().then(() => setInitialized(true));
    }, []);

    return <DbContext value={db}>
        <DbDispatch value={dispatch}>
            {initialized && children}
        </DbDispatch>
    </DbContext>
}