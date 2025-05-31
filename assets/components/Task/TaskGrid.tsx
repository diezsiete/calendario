import { useEffect, useRef, useState } from "react";
import { StopWatchLocalStorage } from "@components/StopWatch";
import { FormHandle } from "@components/Form/Form";
import TaskForm from "@components/Task/TaskForm";
import ModalConfirm, {useModalConfirm} from "@components/Modal/ModalConfirm";
import { ModalHandle } from "@components/Modal/Modal";
import { Task, TaskData } from "@type/Model";
import { deleteTask, getAllTasks, upsertTask } from '@lib/db/idb';
import TaskCard from "@components/Task/TaskCard";

export default function TaskGrid() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const taskFormRef = useRef<FormHandle>(null);
    const [formData, setFormData] = useState<TaskData>({name: '', description: ''});
    const modalTaskFormRef = useRef<ModalHandle>(null);
    const modalDelete = useModalConfirm()

    useEffect(() => {
        fetchTasks();
    }, []);

    function fetchTasks() {
        getAllTasks().then(tasks => setTasks(tasks))
    }

    function showTaskModal(show: boolean, task?: TaskData) {
        setFormData(task || {name: '', description: ''})
        modalTaskFormRef.current?.display(show);
    }

    function handleModalTaskForm(confirm: boolean) {
        if (confirm) {
            taskFormRef.current?.requestSubmit();
        } else {
            showTaskModal(false);
        }
    }
    function handleTaskFormSuccess(task: TaskData) {
        showTaskModal(false);
        upsertTask(task).then(() => fetchTasks())
    }

    const handleTaskDelete = async (task: Task) => {
        if (await modalDelete.waitConfirm(<>Seguro eliminar <b>{task.name}</b></>)) {
            deleteTask(task).then(() => fetchTasks())
        }
    };

    return <>
        <StopWatchLocalStorage name='primer'/>
        <button type="button" className="btn btn-outline-primary" onClick={() => showTaskModal(true)}>
            Crear tarea
        </button>

        {tasks.map(task => <TaskCard key={task.id} task={task}
                                     onDelete={handleTaskDelete}
                                     onEdit={task => showTaskModal(true, task)}
        />)}

        <ModalConfirm id='modalTaskForm' title='Crear tarea' size='xl' ref={modalTaskFormRef}
                      onShown={() => taskFormRef.current.focus()} onConfirm={handleModalTaskForm}>
            <TaskForm task={formData} ref={taskFormRef} onSuccess={handleTaskFormSuccess} />
        </ModalConfirm>

        <ModalConfirm id='modalDelete' onConfirm={modalDelete.handleConfirm} ref={modalDelete.ref} confirmLabel='Eliminar'>
            {modalDelete.message}
        </ModalConfirm>
    </>
}