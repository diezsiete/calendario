import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Navbar from "@components/Navbar";
import DbContextProvider from "@components/Db/DbContextProvider";
import MusicPlayer, { Audio } from "@components/EyeCare/MusicPlayer";
import '@styles/base.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <DbContextProvider>
            <Navbar />
            <MusicPlayer />
            <Audio src='/audio/tirzah-micachu.webm' />
        </DbContextProvider>
    </StrictMode>
);