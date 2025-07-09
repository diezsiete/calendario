import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DbContextProvider from "@components/Db/DbContextProvider";
import { KanbanContextProvider } from "@components/ContextProvider";
import Kanban from "@components/Kanban/Kanban";
import TaskModal from "@components/Task/TaskModal";
import ProjectModal from "@components/Project/ProjectModal";
import '@styles/kanban.scss';
import Navbar from "@components/Navbar";

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <DbContextProvider>
            <KanbanContextProvider>
                <Navbar />
                <Kanban />
                <TaskModal />
                <ProjectModal />
            </KanbanContextProvider>
        </DbContextProvider>
    </StrictMode>
);