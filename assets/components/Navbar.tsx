import EyeCare from "@components/EyeCare/EyeCare";
import DropdownDb from "@components/Db/DropdownDb";

type NavbarProps = { onNewTask?: () => void }

export default function Navbar({ onNewTask } : NavbarProps ) {

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
                        {onNewTask && (
                            <li className="nav-item">
                                <button className="nav-link" onClick={() => onNewTask?.()}>
                                    Crear tarea
                                </button>
                            </li>
                        )}
                    </ul>
                    <EyeCare className='me-2'/>
                    <DropdownDb/>
                </div>
            </div>
        </nav>
    )
}