import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DbContextProvider from "@components/Db/DbContextProvider";
import ProjectContextProvider from "@components/Project/ProjectContextProvider";
import { TaskModalContextProvider } from "@components/Task/TaskContextProvider";
import Navbar from "@components/Navbar";
import TaskModal from "@components/Task/TaskModal";
import CalendarContextProvider from "@components/Calendario/CalendarContextProvider";
import CalendarGrid from "@components/Calendario/CalendarGrid";
import '@styles/calendario.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <DbContextProvider>
            <ProjectContextProvider>
                <TaskModalContextProvider>
                    <CalendarContextProvider>
                        <Navbar />
                        <CalendarGrid />
                        <TaskModal />
                    </CalendarContextProvider>
                </TaskModalContextProvider>
            </ProjectContextProvider>
        </DbContextProvider>
    </StrictMode>
);