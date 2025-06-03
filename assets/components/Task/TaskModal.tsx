import { ActionDispatch, createContext, ReactNode, useContext, useEffect, useReducer, useRef } from "react";
import Form, { FormHandle } from "@components/Form/Form";
import Modal, { ModalBody, ModalFooter, ModalHandle } from "@components/Modal/Modal";
import { TaskDescription, TaskName, useTaskForm } from "@components/Task/TaskForm";
import { Task, TaskData } from "@type/Model";
import { taskDataEmpty } from "@lib/model";
import { deleteTask, upsertTask } from "@lib/idb/tasks";
import ConfirmButton, { ConfirmButtonHandle } from "@components/Form/ConfirmButton";
import '@styles/components/task/task-modal.scss';

type TaskModalState = { task: TaskData|Task, show: boolean, upserted: boolean };
type TaskModalReducerActionType = 'newTaskOpened'|'editTaskOpened'|'modalClosed'|'taskUpserted'
type TaskModalReducerAction = {type: TaskModalReducerActionType, task?: Task};

export const TaskModalContext = createContext<TaskModalState>(null);
export const TaskModalDispatch = createContext<ActionDispatch<[action: TaskModalReducerAction]>>(null);

export function TaskModalContextProvider({ children } : { children: ReactNode} ) {
    const [state, dispatch] = useReducer(taskModalReducer, { task: taskDataEmpty(), show: false, upserted: false });

    return (
        <TaskModalContext.Provider value={state}>
            <TaskModalDispatch value={dispatch}>
                {children}
                <TaskModal />
            </TaskModalDispatch>
        </TaskModalContext.Provider>
    )
}

export default function TaskModal() {
    const context = useContext(TaskModalContext);
    const dispatch = useContext(TaskModalDispatch);
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

    const handleTaskUpsert = (task: TaskData) => upsertTask(task).then(() => dispatch({type: 'taskUpserted'}));

    const handleTaskDelete = (task: Task) => deleteTask(task).then(() => dispatch({type: 'taskUpserted'}));

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

function taskModalReducer(state: TaskModalState, action: TaskModalReducerAction): TaskModalState {
    switch (action.type) {
        case "newTaskOpened": {
            return { task: taskDataEmpty(), show: true, upserted: false };
        }
        case 'editTaskOpened': {
            return { task: action.task, show: true, upserted: false };
        }
        case 'modalClosed': {
            return {...state, show: false, upserted: false };
        }
        case 'taskUpserted': {
            return {...state, show: false, upserted: true };
        }
        default : {
            throw Error('Unknown action: ' + action.type);
        }
    }
}