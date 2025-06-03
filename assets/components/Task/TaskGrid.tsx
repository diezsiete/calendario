import {useContext, useEffect, useState} from "react";
import ModalConfirm, {useModalConfirm} from "@components/Modal/ModalConfirm";
import { Task } from "@type/Model";
import { getAllTasks } from '@lib/idb/tasks';
import TaskCard from "@components/Task/TaskCard";
import { TaskModalContext, TaskModalDispatch } from "@components/Task/TaskModal";

export default function TaskGrid() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const taskModalContext = useContext(TaskModalContext);
    const taskModalDispatch = useContext(TaskModalDispatch);
    const modalDelete = useModalConfirm()

    useEffect(() => {
        fetchTasks();
    }, []);
    useEffect(() => {
        if (taskModalContext.upserted) {
            fetchTasks();
        }
    }, [taskModalContext.upserted]);

    function fetchTasks() {
        getAllTasks().then(tasks => setTasks(tasks))
    }

    function handleTaskEdit(task: Task) {
        taskModalDispatch({type: 'editTaskOpened', task})
    }

    return <>
        <div className="container-fluid">
            <div className="row">
                {tasks.map(task => <TaskCard key={task.id} task={task} className='col-4' onEdit={handleTaskEdit} />)}
            </div>
        </div>

        <ModalConfirm id='modalDelete' onConfirm={modalDelete.handleConfirm} ref={modalDelete.ref}
                      confirmLabel='Eliminar'>
            {modalDelete.message}
        </ModalConfirm>
    </>
}