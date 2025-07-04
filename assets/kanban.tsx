import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import KanbanNavbar from "@components/Kanban/KanbanNavbar";
import KanbanContextProvider from "@components/Kanban/KanbanContextProvider";
import Kanban from "@components/Kanban/Kanban";
import DbContextProvider from "@components/Db/DbContextProvider";
import TaskModal from "@components/Kanban/TaskModal";
import ProjectModal from "@components/Project/ProjectModal";
import '@styles/kanban.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <DbContextProvider>
            <KanbanContextProvider>
                <KanbanNavbar />
                <Kanban />
                <TaskModal />
                <ProjectModal />
            </KanbanContextProvider>
        </DbContextProvider>
    </StrictMode>
);