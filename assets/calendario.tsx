import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DbContextProvider from "@components/Db/DbContextProvider";
import ProjectContextProvider from "@components/Project/ProjectContextProvider";
import { TaskModalContextProvider } from "@components/ContextProvider";
import Navbar from "@components/Navbar";
import Calendar from "@components/Calendario/Calendar";
import TaskModal from "@components/Task/TaskModal";
import '@styles/calendario.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <DbContextProvider>
            <ProjectContextProvider>
                <TaskModalContextProvider>
                    <Navbar />
                    <Calendar />
                    <TaskModal />
                </TaskModalContextProvider>
            </ProjectContextProvider>
        </DbContextProvider>
    </StrictMode>
);