import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import KanbanNavbar from "@components/Kanban/KanbanNavbar";
import TaskGrid from "@components/Task/TaskGrid";
import DbContextProvider from "@components/Db/DbContextProvider";
import KanbanContextProvider from "@components/Kanban/KanbanContextProvider";
import KanbanTaskModal from "@components/Kanban/TaskModal";
import '@styles/base.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <DbContextProvider>
            <KanbanContextProvider>
                <KanbanNavbar />
                <TaskGrid />
                <KanbanTaskModal />
            </KanbanContextProvider>
        </DbContextProvider>
    </StrictMode>
);