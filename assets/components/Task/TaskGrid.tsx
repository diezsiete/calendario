import { useState } from "react";
import Timer from "@components/Timer";
import Modal from "@components/Modal/Modal";
import TaskForm from "@components/Task/TaskForm";

export default function TaskGrid() {
    const [showTaskFromModal, setShowTaskFromModal] = useState<boolean>(false);

    return <>
        <div className="alert alert-primary" role="alert">
            A simple primary alert—check it out!
        </div>
        <Timer name='primerTimer' />
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#exampleModal"
                onClick={() => setShowTaskFromModal(true)}
        >
            Launch demo modal
        </button>
        <Modal id='exampleModal' show={showTaskFromModal} title='Crear tarea' size='xl'>
            <TaskForm />
        </Modal>
    </>
}