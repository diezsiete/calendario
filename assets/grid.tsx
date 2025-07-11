import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Navbar from "@components/Navbar";
import TaskGrid from "@components/Task/TaskGrid";
import { TaskGridContextProvider } from "@components/Task/TaskContextProvider";
import TaskModal from "@components/Task/TaskModal";
import '@styles/base.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <TaskGridContextProvider>
            <Navbar />
            <TaskGrid />
            <TaskModal />
        </TaskGridContextProvider>
    </StrictMode>
);