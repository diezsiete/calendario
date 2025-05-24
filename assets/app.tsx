import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import '@styles/app.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <h1>Calendario</h1>
        <div className="alert alert-primary" role="alert">
            A simple primary alert—check it out!
        </div>
    </StrictMode>
);