import { useContext, useRef } from "react";
import Dropdown, { DropdownItemButton } from "@components/Dropdown";
import { TaskModalDispatch } from "@components/Task/TaskModal";
import { exportIdb, handleUploadRestoreFile } from '@lib/idb/idb';
import { StopWatchLocalStorage } from "@components/StopWatch";
import EyeCare from "@components/EyeCare/EyeCare";

export default function CalendarioNavbar() {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const dispatch = useContext(TaskModalDispatch);

    function handleImportClick() {
        if (!inputFileRef.current) return;
        inputFileRef.current.click();
    }

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">Calendario</span>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText"
                        aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarText">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <button className="nav-link" onClick={() => dispatch({type: 'newTaskOpened'})}>
                                Crear tarea
                            </button>
                        </li>
                    </ul>
                    <EyeCare className='me-2' />
                    <StopWatchLocalStorage name='primer' className='me-2' />
                    <Dropdown title='Backup' menuEnd>
                        <DropdownItemButton onClick={exportIdb}>Export DB</DropdownItemButton>
                        <DropdownItemButton onClick={handleImportClick}>
                            Import DB
                            <input className="d-none" type="file" accept=".json" onChange={handleUploadRestoreFile}
                                   ref={inputFileRef}/>
                        </DropdownItemButton>
                    </Dropdown>
                </div>
            </div>
        </nav>
    )
}