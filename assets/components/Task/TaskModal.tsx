import { ActionDispatch, createContext, ReactNode, useContext, useEffect, useReducer, useRef } from "react";
import { FormHandle } from "@components/Form/Form";
import Modal, { ModalBody, ModalFooter, ModalHandle } from "@components/Modal/Modal";
import { useHandleConfirm } from "@components/Modal/ModalConfirm";
import TaskForm from "@components/Task/TaskForm";
import { Task, TaskData } from "@type/Model";
import { taskDataEmpty } from "@lib/model";
import { deleteTask, upsertTask } from "@lib/idb/tasks";
import ConfirmButton, { ConfirmButtonHandle } from "@components/Form/ConfirmButton";

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
    const handleConfirm = useHandleConfirm(confirm => {
        if (confirm) {
            taskFormRef.current?.requestSubmit();
        } else {
            dispatch({type: 'modalClosed'})
        }
    });

    useEffect(() => {
        modalTaskFormRef.current?.display(context.show);
    }, [context.show]);

    function handleTaskFormSuccess(task: TaskData) {
        upsertTask(task).then(() => dispatch({type: 'taskUpserted'}))
    }

    const handleTaskDelete = async (task: Task) => {
        deleteTask(task).then(() => dispatch({type: 'taskUpserted'}))
    };
    function handleModalHidden() {
        deleteConfirmRef.current?.reset();
        handleConfirm(false, 'backdrop');
    }

    return <>
        <Modal id='modalTaskForm' size='xl' ref={modalTaskFormRef} title={context.task.id ? 'Editar tarea' : 'Crear tarea'}
               onShown={() => taskFormRef.current.focus()}
               onHidden={() => handleModalHidden()}>
            <ModalBody>
                <TaskForm task={context.task} ref={taskFormRef} onSuccess={handleTaskFormSuccess}/>
            </ModalBody>
            <ModalFooter>
                {context.task.id &&
                    <div className='flex-grow-1'>
                        <ConfirmButton onConfirm={() => handleTaskDelete(context.task as Task)} ref={deleteConfirmRef}/>
                    </div>}
                <button type="button" className="btn btn-secondary" onClick={() => handleConfirm(false, 'button')}>
                    Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleConfirm(true, 'button')}>
                    Guardar
                </button>
            </ModalFooter>
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