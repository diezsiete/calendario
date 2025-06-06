import { useContext, useEffect, useRef, useState } from "react";
import Form, { FormHandle } from "@components/Form/Form";
import Modal, { ModalBody, ModalFooter, ModalHandle } from "@components/Modal/Modal";
import { TaskDescription, TaskName, useTaskForm } from "@components/Task/TaskForm";
import { Task, TaskData } from "@type/Model";
import { TaskContext, TaskDispatch, TaskReducerCrudType } from "@lib/state/task";
import { addTask, deleteTask, updateTask } from "@lib/idb/tasks";
import ConfirmButton, { ConfirmButtonHandle } from "@components/Form/ConfirmButton";
import '@styles/components/task/task-modal.scss';
import TaskStatus from "@components/Task/TaskStatus";

export default function TaskModal() {
    const context = useContext(TaskContext);
    const dispatch = useContext(TaskDispatch);
    const [modifyTaskPending, setModifyTaskPending] = useState<{type: TaskReducerCrudType, task: Task|TaskData}|null>(null)
    const modalTaskFormRef = useRef<ModalHandle>(null);
    const taskFormRef = useRef<FormHandle>(null);
    const deleteConfirmRef = useRef<ConfirmButtonHandle>(null);
    const { data, violations, updateField, submit } = useTaskForm(context.task);

    useEffect(() => {
        modalTaskFormRef.current?.display(context.modalShow);
        if (!context.modalShow) {
            deleteConfirmRef.current?.reset();
            if (modifyTaskPending) {
                const {type, task} = modifyTaskPending;
                setModifyTaskPending(null);
                modifyTask(type, task).then(task => task && dispatch({type, task}))
            }
        }
    }, [context.modalShow, modifyTaskPending, dispatch]);

    const handleTaskUpsert = (data: TaskData) => queueModifyTaskDispatch(data.id ? 'taskUpdatedFromModal' : 'taskInserted', data);
    const handleTaskDelete = (data: TaskData) => queueModifyTaskDispatch('taskDeleted', data);
    const queueModifyTaskDispatch = (type: TaskReducerCrudType, task: Task|TaskData) => {
        setModifyTaskPending({type, task})
        modalTaskFormRef.current.hide();
    }
    const modifyTask = (type: TaskReducerCrudType, task: Task|TaskData): Promise<Task|undefined> => {
        if (type === 'taskInserted') {
            return addTask(task);
        } else if (type === 'taskUpdatedFromModal') {
            return updateTask(task as Task)
        } else if (type === 'taskDeleted') {
            return new Promise(resolve => deleteTask(task as Task).then(() => resolve(task as Task)))
        }
        return new Promise(resolve => resolve(undefined));
    }

    return <>
        <Modal id='modalTaskForm' size='xl' ref={modalTaskFormRef} className='task'
               onShown={() => !context.task.id && taskFormRef.current.focus()}
               onHidden={() => dispatch({type: 'modalClosed'})}>
            <Form preventDefault onSubmit={() => submit(handleTaskUpsert)} ref={taskFormRef}>
                <div className="modal-header">
                    <TaskName value={data.name} violation={violations.name} onChange={updateField} />
                </div>
                <ModalBody>
                    <TaskDescription value={data.description} violation={violations.description} onChange={updateField} onShiftEnter={() => submit(handleTaskUpsert)} />
                    <TaskStatus className='mt-3' value={data.status} onChange={status => updateField('status', status)} />
                </ModalBody>
                <ModalFooter>
                    {context.task.id &&
                        <div className='flex-grow-1'>
                            <ConfirmButton onConfirm={() => handleTaskDelete(context.task as Task)} ref={deleteConfirmRef}/>
                        </div>}
                    <button type="button" className="btn btn-secondary" onClick={() => dispatch({type: 'modalClosed'})}>
                        Cancelar
                    </button>
                    <button className="btn btn-primary">
                        Guardar
                    </button>
                </ModalFooter>
            </Form>
        </Modal>
    </>
}