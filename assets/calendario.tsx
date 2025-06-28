import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DbContextProvider from "@components/Db/DbContextProvider";
import Calendar from "@components/Calendario/Calendar";
import Navbar from "@components/Navbar";
import '@styles/calendario.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <DbContextProvider>
            <Navbar />
            <Calendar />
        </DbContextProvider>
    </StrictMode>
);