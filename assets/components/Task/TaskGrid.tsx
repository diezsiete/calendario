import { useContext, useEffect, useState } from "react";
import ModalConfirm, { useModalConfirm } from "@components/Modal/ModalConfirm";
import TaskCard from "@components/Task/TaskCard";
import { TaskModalContext, TaskModalDispatch } from "@components/Task/TaskModal";
import { getAllTasks } from '@lib/idb/tasks';
import { Task } from "@type/Model";

export default function TaskGrid() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const taskModalContext = useContext(TaskModalContext);
    const taskModalDispatch = useContext(TaskModalDispatch);
    const modalDelete = useModalConfirm();

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
            <div className="row row-cols-1 row-cols-md-4 g-3 mt-0">
                {tasks.map(task => <div className="col" key={task.id}>
                    <TaskCard task={task} onEdit={handleTaskEdit} />
                </div>)}
            </div>
        </div>

        <ModalConfirm id='modalDelete' onConfirm={modalDelete.handleConfirm} ref={modalDelete.ref}
                      confirmLabel='Eliminar'>
            {modalDelete.message}
        </ModalConfirm>
    </>
}