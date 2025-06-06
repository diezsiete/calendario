import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CalendarioNavbar from "@components/CalendarioNavbar";
import TaskContextProvider from "@components/Task/TaskContextProvider";
import TaskGrid from "@components/Task/TaskGrid";
import TaskModal from "@components/Task/TaskModal";
import DbContextProvider from "@components/Db/DbContextProvider";
// import MusicPlayer, { Audio } from "@components/EyeCare/MusicPlayer";
import '@styles/app.scss';

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <DbContextProvider>
            <TaskContextProvider>
                <CalendarioNavbar />
                <TaskGrid />
                <TaskModal />
                {/*<MusicPlayer />*/}
                {/*<Audio src='/audio/tirzah-micachu.webm' />*/}
            </TaskContextProvider>
        </DbContextProvider>
    </StrictMode>
);