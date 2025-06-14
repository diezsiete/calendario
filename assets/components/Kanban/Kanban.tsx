import { useContext, useEffect, useState } from "react";
import { TaskContext, taskStatuses } from "@lib/state/task";
import { Task, TaskStatus as TypeTaskStatus } from "@type/Model";
import TaskCard from "@components/Task/TaskCard";
import { getAllTasksByStatus, getAllTasksWithCompleteTimers } from "@lib/idb/tasks";
import { DbContext } from "@components/Db/DbContextProvider";

type TaskByStatus = Record<TypeTaskStatus, Task[]>;

export default function Kanban() {
    const [taskByStatus, setTaskByStatus] = useState<TaskByStatus>(Object.keys(taskStatuses).reduce((state, status) => {
        state[status] = [];
        return state;
    }, {} as TaskByStatus));
    const dbContext = useContext(DbContext);
    const context = useContext(TaskContext);

    useEffect(() => {
        if (dbContext) {
            Object.keys(taskStatuses).forEach(taskStatus => getAllTasksByStatus(taskStatus).then(tasks => {
                setTaskByStatus(prev => ({...prev, [taskStatus]: tasks}))
            }))
        }
    }, [dbContext]);

    useEffect(() => {
        Object.keys(taskStatuses).forEach(taskStatus => getAllTasksWithCompleteTimers(taskStatus).then(tasks => {
            setTaskByStatus(prev => ({...prev, [taskStatus]: tasks}))
        }))
    }, []);

    useEffect(() => {
        if (context.crudType) {
            setTaskByStatus(prev => {
                if (context.crudType === 'taskInserted') {
                    return {...prev, [context.task.status]: [context.task as Task, ...prev[context.task.status]]}
                } else if (context.crudType === 'taskUpdated') {
                    return Object.keys(taskStatuses).reduce((state, status) => {
                        if (status === context.task.status) {
                            state[status] = !prev[status].filter((task: Task) => task.id === context.task.id).length
                                ? [context.task as Task, ...prev[status]]
                                : prev[status].map(task => task.id === context.task.id ? context.task as Task : task);
                        } else {
                            state[status] = prev[status].filter((task: Task) => task.id !== context.task.id)
                        }
                        return state;
                    }, {} as TaskByStatus)
                } else if (context.crudType === 'taskDeleted') {
                    return {...prev, [context.task.status]: prev[context.task.status].filter(task => task.id !== context.task.id)}
                }
                return prev;
            })
        }
    }, [context.crudType, context.task]);

    return <main>
        {Object.keys(taskByStatus).map(status => <div key={status} className='kanban-column'>
            <div className="kanban-column-content">
                <div className="kanban-column-content-header">
                    {taskStatuses[status]}
                </div>
                <div className="kanban-column-content-body">
                    {taskByStatus[status].map((task: Task) => <TaskCard key={task.id} className='mb-3' task={task} />)}
                </div>
            </div>
        </div>)}
    </main>
}