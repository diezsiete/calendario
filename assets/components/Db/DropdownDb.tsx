import { useContext, useEffect, useRef, useState } from "react";
import Dropdown, { DropdownDivider, DropdownItemButton } from "@components/Dropdown";
import { getDatabase, exportIdb, handleUploadRestoreFile } from "@lib/idb/idb";
import { DbContext, DbDispatch } from "@components/Db/DbContextProvider";
import rem from "@lib/idb/rem";

export default function DropdownDb() {
    const dbContext = useContext(DbContext);
    const dbDispatch = useContext(DbDispatch);
    const [dbs, setDbs] = useState<IDBDatabaseInfo[]>([]);
    const [dbActive, setDbActive] = useState(getDatabase().name);
    const inputFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        indexedDB.databases().then(databases => setDbs(databases));
    }, []);
    useEffect(() => {
        if (dbContext) {
            setDbActive(dbContext)
        }
    }, [dbContext]);

    function handleDbSelect(dbName: string) {
        dbs.forEach(db => {
            if (db.name === dbName) {
                rem.setDatabase(db.name, db.version).then(rem => dbDispatch(rem.dbName))
            }
        })
    }

    const dbColor = (db: string): string => db === 'calendario' ? 'success' : 'warning-alt'

    return <Dropdown title='Db' menuEnd btnClassName={`btn-outline-${dbColor(dbActive)}`}>
        {dbs.map(db =>
            <DropdownItemButton key={db.name}
                                active={db.name === dbActive}
                                className={dbColor(db.name)}
                                onClick={() => handleDbSelect(db.name)}>
                {db.name}
            </DropdownItemButton>
        )}
        <DropdownDivider />
        <DropdownItemButton onClick={exportIdb}>Export DB</DropdownItemButton>
        <DropdownItemButton onClick={() => inputFileRef.current?.click()}>
            Import DB
            <input className="d-none" type="file" accept=".json" onChange={handleUploadRestoreFile} ref={inputFileRef}/>
        </DropdownItemButton>
    </Dropdown>
}