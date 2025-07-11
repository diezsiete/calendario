import { useContext, useEffect, useState } from "react";
import EyeCare from "@components/EyeCare/EyeCare";
import DropdownDb from "@components/Db/DropdownDb";
import { TaskModalDispatch } from "@lib/state/task-modal-state";
import { ProjectFilter } from "@components/Project/ProjectSelect";
import { NavbarTaskStopwatch } from "@components/Task/TaskStopwatch";

export default function Navbar() {
    const dispatch = useContext(TaskModalDispatch);
    const [navbarState, setNavbarState] = useState({createTask: false, projectFilter: false, navLink: {href: '/', title: ''}});

    useEffect(() => {
        if (window.location.pathname === '/kanban') {
            setNavbarState({createTask: false, projectFilter: true, navLink: {href: '/calendario', title: 'Calendario'}})
        } else if (window.location.pathname !== '/') {
            setNavbarState({createTask: true, projectFilter: true, navLink: {href: '/kanban', title: 'Kanban'}})
        } else {
            setNavbarState({createTask: false, projectFilter: false, navLink: {href: '/kanban', title: 'Kanban'}})
        }
    }, []);

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
                            <a className="nav-link" href={navbarState.navLink.href}>
                                {navbarState.navLink.title}
                            </a>
                        </li>
                        {navbarState.createTask && (
                            <li className="nav-item">
                                <button className="nav-link" onClick={() => dispatch({type: 'taskModalOpened'})}>
                                    Crear tarea
                                </button>
                            </li>
                        )}
                    </ul>
                    <NavbarTaskStopwatch className='me-2' />
                    {navbarState.projectFilter && <ProjectFilter className='me-2'/>}
                    <EyeCare className='me-2'/>
                    <DropdownDb/>
                </div>
            </div>
        </nav>
    )
}