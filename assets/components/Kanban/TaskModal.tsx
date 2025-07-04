import { useContext, useEffect, useRef } from "react";
import Modal, { ModalBody, ModalFooter, ModalHandle, ModalHeader } from "@components/Modal/Modal";
import Form, { FormHandle } from "@components/Form/Form";
import { TaskDescription, TaskName, validateTaskForm } from "@components/Task/TaskForm";
import TaskStatus from "@components/Task/TaskStatus";
import ConfirmButton, { ConfirmButtonHandle } from "@components/Form/ConfirmButton";
import ProjectSelect from "@components/Project/ProjectSelect";
import { useSimpleForm } from "@lib/hooks/form";
import { KanbanContext, KanbanDispatch } from "@lib/state/kanban-state";
import rem from "@lib/idb/rem";
import { Task, TaskData } from "@type/Model";
import '@styles/components/task/task-modal.scss';

export default function TaskModal() {
    const context = useContext(KanbanContext);
    const dispatch = useContext(KanbanDispatch);
    const modalTaskFormRef = useRef<ModalHandle>(null);
    const taskFormRef = useRef<FormHandle>(null);
    const deleteConfirmRef = useRef<ConfirmButtonHandle>(null);
    const { data, setData, violations, updateField, submit } = useSimpleForm<Task|TaskData>(rem.tasks.newTask(), validateTaskForm);

    useEffect(() => {
        modalTaskFormRef.current?.display(context.modalShow);
        if (context.modalShow) {
            setData(context.taskId ? rem.tasks.getTask(context.taskId) : rem.tasks.newTask());
        } else {
            deleteConfirmRef.current?.reset();
        }
    }, [context.modalShow, context.taskId, setData]);

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
        <Modal id='kanbanTaskModal' size='xl' ref={modalTaskFormRef} className='task border-inner'
               onShown={() => !data.id && taskFormRef.current.focus()}
               onHidden={() => {
                   dispatch({type: 'modalClosed'});
                   // resetear valores, cuando se vuelva a abrir force re-renders de inputs. Cuando modal este oculto completamente
                   setData(rem.tasks.newTask());
               }}
        >
            <Form preventDefault onSubmit={() => submit(handleTaskUpsert)} ref={taskFormRef}>
                <ModalHeader className='is-input'>
                    <TaskName value={data.name} violation={violations.name} onChange={updateField} />
                </ModalHeader>
                <ModalBody>
                    <TaskDescription value={data.description} violation={violations.description} onChange={updateField} onShiftEnter={() => submit(handleTaskUpsert)} />
                    <div className="d-flex mt-3">
                        <TaskStatus value={data.status} onChange={status => updateField('status', status)} />
                        <ProjectSelect className='ms-3' unselectOption='Sin proyecto' value={data.projectId}
                                       onChange={projectId => updateField('projectId', projectId)}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    {data.id &&
                        <div className='flex-grow-1'>
                            <ConfirmButton onConfirm={() => handleTaskDelete(data.id)} ref={deleteConfirmRef}/>
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