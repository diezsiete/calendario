import { useContext, useEffect, useRef } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "@components/Modal/Modal";
import Form, { FormHandle } from "@components/Form/Form";
import { TaskDescription, TaskName, validateTaskForm } from "@components/Task/TaskForm";
import TaskStatus from "@components/Task/TaskStatus";
import ConfirmButton from "@components/Form/ConfirmButton";
import ProjectSelect from "@components/Project/ProjectSelect";
import { useSimpleForm } from "@lib/hooks/form";
import { TaskModalContext, TaskModalDispatch } from "@lib/state/task-modal-state";
import rem from "@lib/idb/rem";
import { Task, TaskData } from "@type/Model";
import '@styles/components/task/task-modal.scss';

export default function TaskModal() {
    const context = useContext(TaskModalContext);
    const dispatch = useContext(TaskModalDispatch);
    const taskFormRef = useRef<FormHandle>(null);
    const { data, setData, violations, updateField, submit } = useSimpleForm<Task|TaskData>(rem.tasks.newTask(), validateTaskForm);

    useEffect(() => {
        if (context.show) {
            setData(context.task);
        }
    }, [context.show, context.task, setData]);


    function handleTaskUpsert(data: TaskData) {
        if (!data.id) {
            rem.tasks.addTask(data).then(task => dispatch({type: 'taskCreated', task}))
        } else {
            rem.tasks.updateTask(data.id, data).then(task => dispatch({type: 'taskUpdated', task}))
        }
    }

    function handleTaskDelete(taskId: number) {
        rem.tasks.deleteTask(taskId).then(task => dispatch({type: 'taskDeleted', task}))
    }

    return <>
        <Modal show={context.show} id='kanbanTaskModal' size='xl' className='task border-inner'
               onShown={() => !data.id && taskFormRef.current.focus()}
               onHidden={() => {
                   dispatch({type: 'taskModalClosed'})
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
                            <ConfirmButton onConfirm={() => handleTaskDelete(data.id)} reset={!context.show}/>
                        </div>}
                    <button type="button" className="btn btn-secondary" onClick={() => dispatch({type: 'taskModalClosed'})}>
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