import { useContext, useEffect, useState } from "react";
import TaskCard from "@components/Task/TaskCard";
import { TaskContext } from "@lib/state/task";
import { getAllTasks, getAllTasksWithCompleteTimers } from '@lib/idb/tasks';
import { match } from "@lib/util";
import { Task } from "@type/Model";
import { useBreakpoint } from "@lib/react";
import { DbContext } from "@components/Db/DbContextProvider";

export default function TaskGrid() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const dbContext = useContext(DbContext);
    const context = useContext(TaskContext);
    const columns = useMasonry(tasks);

    useEffect(() => {
        if (dbContext) {
            getAllTasks().then(tasks => setTasks(tasks))
        }
    }, [dbContext]);
    useEffect(() => {
        getAllTasksWithCompleteTimers().then(tasks => setTasks(tasks));
    }, []);

    useEffect(() => {
        if (context.crudType) {
            setTasks(prev => {
                if (context.crudType === 'taskInserted') {
                    return [...prev, context.task as Task]
                } else if (context.crudType === 'taskUpdated') {
                    return prev.map(task => task.id === context.task.id ? context.task as Task : task)
                } else if (context.crudType === 'taskDeleted') {
                    return prev.filter(task => task.id !== context.task.id)
                }
                return prev;
            })
        }
    }, [context.crudType, context.task]);

    return <div className="container-fluid">
        <div className="row g-3 mt-0">

            {columns.map((tasks, index) => <div className="col" key={index}>{tasks.map(task =>
                <TaskCard key={task.id} className='mb-3' task={task} />
            )}</div>)}

            {/*{tasks.map(task => <div className="col-md-6 col-lg-4 col-xl-3" key={task.id}>
                <TaskCard task={task} onEdit={handleTaskEdit} />
            </div>)}*/}
        </div>
    </div>
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

