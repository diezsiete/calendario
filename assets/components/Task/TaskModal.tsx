import { ActionDispatch, createContext, ReactNode, useContext, useEffect, useReducer, useRef } from "react";
import { FormHandle } from "@components/Form/Form";
import { ModalHandle } from "@components/Modal/Modal";
import ModalConfirm from "@components/Modal/ModalConfirm";
import TaskForm from "@components/Task/TaskForm";
import { Task, TaskData } from "@type/Model";
import { taskDataEmpty } from "@lib/model";
import { upsertTask } from "@lib/idb/tasks";

type TaskModalState = { task: TaskData|Task, show: boolean, upserted: boolean };
type TaskModalReducerAction = {type: 'newTaskOpened'|'editTaskOpened'|'modalClosed'|'taskUpserted', task?: Task};

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

    useEffect(() => {
        modalTaskFormRef.current?.display(context.show);
    }, [context.show]);

    function handleModalTaskForm(confirm: boolean) {
        if (confirm) {
            taskFormRef.current?.requestSubmit();
        } else {
            dispatch({type: 'modalClosed'})
        }
    }
    function handleTaskFormSuccess(task: TaskData) {
        upsertTask(task).then(() => dispatch({type: 'taskUpserted'}))
    }

    return (
        <ModalConfirm id='modalTaskForm' title='Crear tarea' size='xl' ref={modalTaskFormRef}
                      onShown={() => taskFormRef.current.focus()} onConfirm={handleModalTaskForm}>
            <TaskForm task={context.task} ref={taskFormRef} onSuccess={handleTaskFormSuccess} />
        </ModalConfirm>
    )
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