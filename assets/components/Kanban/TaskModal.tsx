import { useContext, useEffect, useRef, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHandle } from "@components/Modal/Modal";
import Form, { FormHandle } from "@components/Form/Form";
import { TaskDescription, TaskName, useTaskForm } from "@components/Task/TaskForm";
import TaskStatus from "@components/Task/TaskStatus";
import ConfirmButton, { ConfirmButtonHandle } from "@components/Form/ConfirmButton";
import { Task, TaskData } from "@type/Model";
import { KanbanContext, KanbanDispatch } from "@lib/state/kanban-state";
import rem from "@lib/idb/rem";
import '@styles/components/task/task-modal.scss';

export default function TaskModal() {
    const [task, setTask] = useState<Task|TaskData>(rem.tasks.newTask())
    const context = useContext(KanbanContext);
    const dispatch = useContext(KanbanDispatch);
    const modalTaskFormRef = useRef<ModalHandle>(null);
    const taskFormRef = useRef<FormHandle>(null);
    const deleteConfirmRef = useRef<ConfirmButtonHandle>(null);
    const { data, violations, updateField, submit } = useTaskForm(task);

    useEffect(() => {
        modalTaskFormRef.current?.display(context.modalShow);
        if (context.modalShow) {
            setTask(context.taskId ? rem.tasks.getTask(context.taskId) : rem.tasks.newTask());
        } else {
            deleteConfirmRef.current?.reset();
        }
    }, [context.modalShow, context.taskId]);

    function handleTaskUpsert(data: TaskData) {
        if (!data.id) {
            rem.tasks.addTask(data).then(newTask => dispatch({type: 'columnUpdated', columnId: newTask.columnId}))
        } else {
            const oldColumnId = data.columnId;
            rem.tasks.updateTask(data.id, data).then(taskUpdated => {
                const columnId = taskUpdated.columnId + (taskUpdated.columnId !== oldColumnId ? `,${oldColumnId}` : '');
                dispatch({type: 'columnUpdated', columnId: columnId})
            })
        }
    }

    function handleTaskDelete(taskId: number) {
        rem.tasks.deleteTask(taskId).then(taskDeleted => {
            if (taskDeleted) {
                dispatch({type: 'columnUpdated', columnId: taskDeleted.columnId})
            }
        })
    }

    return <>
        <Modal id='kanbanTaskModal' size='xl' ref={modalTaskFormRef} className='task'
               onShown={() => !task.id && taskFormRef.current.focus()}
               onHidden={() => dispatch({type: 'modalClosed'})}
        >
            <Form preventDefault onSubmit={() => submit(handleTaskUpsert)} ref={taskFormRef}>
                <div className="modal-header">
                    <TaskName value={data.name} violation={violations.name} onChange={updateField} />
                </div>
                <ModalBody>
                    <TaskDescription value={data.description} violation={violations.description} onChange={updateField} onShiftEnter={() => submit(handleTaskUpsert)} />
                    <TaskStatus className='mt-3' value={data.status} onChange={status => updateField('status', status)} />
                </ModalBody>
                <ModalFooter>
                    {task.id &&
                        <div className='flex-grow-1'>
                            <ConfirmButton onConfirm={() => handleTaskDelete(task.id)} ref={deleteConfirmRef}/>
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