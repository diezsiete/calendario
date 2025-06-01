import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CalendarioNavbar from "@components/CalendarioNavbar";
import TaskGrid from "@components/Task/TaskGrid";
import '@styles/app.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <CalendarioNavbar />
        <TaskGrid />
    </StrictMode>
);