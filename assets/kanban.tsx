import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CalendarioNavbar from "@components/CalendarioNavbar";
import TaskContextProvider from "@components/Task/TaskContextProvider";
import Kanban from "@components/Kanban/Kanban";
import DbContextProvider from "@components/Db/DbContextProvider";
import '@styles/kanban.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <DbContextProvider>
            <TaskContextProvider>
                <CalendarioNavbar />
                <Kanban />
            </TaskContextProvider>
        </DbContextProvider>
    </StrictMode>
);