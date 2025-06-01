import { useRef } from "react";
import Dropdown, { DropdownItemButton } from "@components/Dropdown";
import { exportIdb, handleUploadRestoreFile } from '@lib/idb/idb';

export default function CalendarioNavbar() {
    const inputFileRef = useRef<HTMLInputElement>(null);

    function handleImportClick() {
        if (!inputFileRef.current) return;
        inputFileRef.current.click();
    }

    return (
        <nav className="navbar bg-body-tertiary">
            <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">Calendario</span>
                <Dropdown title='Backup' menuEnd>
                    <DropdownItemButton onClick={exportIdb}>Export DB</DropdownItemButton>
                    <DropdownItemButton onClick={handleImportClick}>
                        Import DB
                        <input className="d-none" type="file" accept=".json" onChange={handleUploadRestoreFile} ref={inputFileRef} />
                    </DropdownItemButton>
                </Dropdown>
            </div>
        </nav>
    )
}