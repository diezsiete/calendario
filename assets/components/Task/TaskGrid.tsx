import {useContext, useEffect, useState} from "react";
import ModalConfirm, {useModalConfirm} from "@components/Modal/ModalConfirm";
import { Task } from "@type/Model";
import { deleteTask, getAllTasks } from '@lib/idb/tasks';
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

    const handleTaskDelete = async (task: Task) => {
        if (await modalDelete.waitConfirm(<>Seguro eliminar <b>{task.name}</b></>)) {
            deleteTask(task).then(() => fetchTasks())
        }
    };

    return <>
        {tasks.map(task => <TaskCard key={task.id} task={task} onDelete={handleTaskDelete} onEdit={handleTaskEdit} />)}

        <ModalConfirm id='modalDelete' onConfirm={modalDelete.handleConfirm} ref={modalDelete.ref} confirmLabel='Eliminar'>
            {modalDelete.message}
        </ModalConfirm>
    </>
}