import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Navbar from "@components/Navbar";
import TaskGrid from "@components/Task/TaskGrid";
import DbContextProvider from "@components/Db/DbContextProvider";
import KanbanContextProvider from "@components/Kanban/KanbanContextProvider";
import TaskModal from "@components/Task/TaskModal";
import '@styles/base.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <DbContextProvider>
            <KanbanContextProvider>
                <Navbar />
                <TaskGrid />
                <TaskModal />
            </KanbanContextProvider>
        </DbContextProvider>
    </StrictMode>
);