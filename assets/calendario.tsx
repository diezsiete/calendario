import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DbContextProvider from "@components/Db/DbContextProvider";
import Calendar from "@components/Calendario/Calendar";
import Navbar from "@components/Navbar";
import '@styles/calendario.scss';
import ProjectContextProvider from "@components/Project/ProjectContextProvider";

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <DbContextProvider>
            <ProjectContextProvider>
                <Navbar />
                <Calendar />
            </ProjectContextProvider>
        </DbContextProvider>
    </StrictMode>
);