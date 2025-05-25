import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TaskGrid from "@components/Task/TaskGrid";
import '@styles/app.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <h1>Calendario</h1>
        <TaskGrid />
    </StrictMode>
);