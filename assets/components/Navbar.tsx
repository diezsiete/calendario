import { useCallback, useContext, useEffect, useState } from "react";
import classNames from "classnames";
import EyeCare from "@components/EyeCare/EyeCare";
import DropdownDb from "@components/Db/DropdownDb";
import { ProjectFilter } from "@components/Project/ProjectSelect";
import { NavbarTaskStopwatch } from "@components/Task/TaskStopwatch";
import WeekRangePicker from "@components/Calendario/WeekRangePicker";
import { TaskModalDispatch } from "@lib/state/task-modal-state";

export default function Navbar() {
    const dispatch = useContext(TaskModalDispatch);
    const [navbarState, navbarStateSetter] = useState({pathname: '/', createTask: false, projectFilter: false, navLink: {href: '/', title: ''}});

    const setNavbarState = useCallback((createTask: boolean, projectFilter: boolean, navLinkTitle: 'Calendario'|'Kanban' = 'Calendario') => {
        const pathname = window.location.pathname;
        const navLink = navLinkTitle === 'Calendario' ? {href: '/calendario', title: 'Calendario'} : {href: '/kanban', title: 'Kanban'};
        navbarStateSetter({pathname, createTask, projectFilter, navLink})
    }, []);

    useEffect(() => {
        if (window.location.pathname === '/kanban') {
            setNavbarState(false, true, 'Calendario');
        } else if (window.location.pathname === '/calendario') {
            setNavbarState(true, true, 'Kanban');
        } else if (window.location.pathname !== '/') {
            setNavbarState(true, true, 'Kanban');
        } else {
            setNavbarState(false, false, 'Kanban');
        }
    }, [setNavbarState]);

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">Calendario</span>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText"
                        aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarText">
                    <ul className={classNames('navbar-nav mb-2 mb-lg-0', {'me-auto': navbarState.pathname !== '/calendario'})}>
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
                    {navbarState.pathname === '/calendario' && <WeekRangePicker className='ms-2 me-auto' />}
                    {navbarState.projectFilter && <>
                        <NavbarTaskStopwatch className='me-2' />
                        <ProjectFilter className='me-2'/>
                    </>}
                    <EyeCare className='me-2'/>
                    <DropdownDb/>
                </div>
            </div>
        </nav>
    )
}