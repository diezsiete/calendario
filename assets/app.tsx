import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CalendarioNavbar from "@components/CalendarioNavbar";
import TaskGrid from "@components/Task/TaskGrid";
import { TaskModalContextProvider } from "@components/Task/TaskModal";
// import MusicPlayer, { Audio } from "@components/EyeCare/MusicPlayer";
import '@styles/app.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <TaskModalContextProvider>
            <CalendarioNavbar />
            <TaskGrid />
            {/*<MusicPlayer />*/}
            {/*<Audio src='/audio/tirzah-micachu.webm' />*/}
        </TaskModalContextProvider>
    </StrictMode>
);