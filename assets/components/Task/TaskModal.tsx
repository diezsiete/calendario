import {useContext, useEffect, useRef } from "react";
import Form, { FormHandle } from "@components/Form/Form";
import Modal, { ModalBody, ModalFooter, ModalHandle } from "@components/Modal/Modal";
import { TaskDescription, TaskName, useTaskForm } from "@components/Task/TaskForm";
import { Task, TaskData } from "@type/Model";
import { TaskContext, TaskDispatch } from "@lib/state/task";
import { addTask, deleteTask, updateTask } from "@lib/idb/tasks";
import ConfirmButton, { ConfirmButtonHandle } from "@components/Form/ConfirmButton";
import '@styles/components/task/task-modal.scss';

export default function TaskModal() {
    const context = useContext(TaskContext);
    const dispatch = useContext(TaskDispatch);
    const modalTaskFormRef = useRef<ModalHandle>(null);
    const taskFormRef = useRef<FormHandle>(null);
    const deleteConfirmRef = useRef<ConfirmButtonHandle>(null);
    const { data, violations, updateField, submit } = useTaskForm(context.task)

    useEffect(() => {
        modalTaskFormRef.current?.display(context.show);
        if (!context.show) {
            deleteConfirmRef.current?.reset();
        }
    }, [context.show]);

    const handleTaskUpsert = (data: TaskData) => {
        if (data.id) {
            updateTask(data as Task).then(task => task && dispatch({type: 'taskUpdated', task}))
        } else {
            addTask(data).then(task => task && dispatch({type: 'taskInserted', task}))
        }
    };

    const handleTaskDelete = (task: Task) => deleteTask(task).then(() => dispatch({type: 'taskDeleted', task: task}));

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