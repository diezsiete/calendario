import { useContext, useEffect, useState } from "react";
import ModalConfirm, { useModalConfirm } from "@components/Modal/ModalConfirm";
import TaskCard from "@components/Task/TaskCard";
import { TaskContext, TaskDispatch } from "@lib/state/task";
import { getAllTasksWithCompleteTimers } from '@lib/idb/tasks';
import { match } from "@lib/util";
import { Task } from "@type/Model";
import { useBreakpoint } from "@lib/react";

export default function TaskGrid() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const context = useContext(TaskContext);
    const dispatch = useContext(TaskDispatch);
    const modalDelete = useModalConfirm();
    const columns = useMasonry(tasks);

    useEffect(() => {
        getAllTasksWithCompleteTimers().then(tasks => setTasks(tasks));
    }, []);

    useEffect(() => {
        if (context.inserted) {
            dispatch({type: 'stateCleaned'})
            const taskInserted = context.task as Task;
            setTasks(prev => [...prev, taskInserted])
        }
    }, [context.inserted, context.task, dispatch]);
    useEffect(() => {
        if (context.updated) {
            dispatch({type: 'stateCleaned'})
            const taskUpdated = context.task as Task;
            setTasks(prev => prev.map(task => task.id === taskUpdated.id ? taskUpdated : task))
        }
    }, [context.updated, context.task, dispatch]);
    useEffect(() => {
        if (context.deleted) {
            dispatch({type: 'stateCleaned'})
            const taskDeleted = context.task as Task;
            setTasks(prev => prev.filter(task => task.id !== taskDeleted.id))
        }
    }, [context.deleted, context.task, dispatch]);

    return <>
        <div className="container-fluid">
            <div className="row g-3 mt-0">

                {columns.map((tasks, index) => <div className="col" key={index}>{tasks.map(task =>
                    <TaskCard key={task.id} className='mb-3' task={task} onEdit={task => dispatch({type: 'editTaskOpened', task})} />
                )}</div>)}

                {/*{tasks.map(task => <div className="col-md-6 col-lg-4 col-xl-3" key={task.id}>
                    <TaskCard task={task} onEdit={handleTaskEdit} />
                </div>)}*/}
            </div>
        </div>

        <ModalConfirm id='modalDelete' onConfirm={modalDelete.handleConfirm} ref={modalDelete.ref}
                      confirmLabel='Eliminar'>
            {modalDelete.message}
        </ModalConfirm>
    </>
}

function useMasonry(tasks: Task[]) {
    const breakpoint = useBreakpoint();
    const [numColumns, setNumColumns] = useState(0);
    const [columns, setColumns] = useState<Task[][]>([]);

    useEffect(() => {
        if (breakpoint) {
            setNumColumns(match(breakpoint, {xs: 1, sm: 1, md: 2, lg: 3, xl: 4}, 0))
        }
    }, [breakpoint]);

    useEffect(() => {
        let columnsCount = 0;
        setColumns(tasks.reduce<Task[][]>((columns, task) => {
            if (numColumns) {
                columnsCount = columnsCount === numColumns ? 0 : columnsCount;
                if (columns.length < columnsCount + 1) {
                    columns.push([])
                }
                columns[columnsCount].push(task);
                columnsCount++;
            }
            return columns;
        }, []));
    }, [numColumns, tasks]);

    return columns;
}

