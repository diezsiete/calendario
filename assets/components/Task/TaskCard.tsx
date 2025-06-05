import { useContext, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { StopWatchHandle, StopWatchTask } from "@components/StopWatch";
import { Task, TaskData, TaskStatus as TypeTaskStatus, Timer } from "@type/Model";
import { getTaskTimers, getTimersTotal, startTaskTimer, stopTaskTimer, updateTask as updateIdbTask } from '@lib/idb/tasks';
import TaskStatus from "@components/Task/TaskStatus";
import { TaskDispatch } from "@lib/state/task";
import '@styles/components/task/task-card.scss'

type TaskCardProps = { task: Task, className?: string, onEdit?: (task: Task) => void };

export default function TaskCard({ task, className, onEdit }: TaskCardProps) {
    const [stopWatchSeconds, setStopWatchSeconds] = useState(0);
    const [stopWatchRunning, setStopWatchRunning] = useState(false);
    const [endStatus, setEndStatus] = useState<TypeTaskStatus>('paused')
    const taskCurrentTimer = useRef<Timer>(null);
    const dispatch = useContext(TaskDispatch);
    const stopWatchRef = useRef<StopWatchHandle>(null);

    useEffect(() => {
        getTaskTimers(task).then(timers => setStopWatchSeconds(getTimersTotal(timers)))
    }, [task]);

    async function startTimerHandler(start: number) {
        setStopWatchRunning(true);
        taskCurrentTimer.current = await startTaskTimer(task, start);
        updateTask(task, {status: 'inprogress'});
    }

    async function endTimerHandler(end: number) {
        setStopWatchRunning(false);
        if (taskCurrentTimer.current) {
            taskCurrentTimer.current = await stopTaskTimer(task, taskCurrentTimer.current.id, end);
            if (taskCurrentTimer.current) {
                setStopWatchSeconds(prev => prev + (end - taskCurrentTimer.current.start));
            }
        }
        updateTask(task, {status: endStatus});
        setEndStatus('paused');
    }

    async function handleStatusChange(status: TypeTaskStatus) {
        if (status === 'inprogress' && !stopWatchRunning) {
            stopWatchRef.current.run();
        } else if (status !== 'inprogress' && stopWatchRunning) {
            setEndStatus(status);
            stopWatchRef.current.stop();
        } else {
            updateTask(task, {status});
        }
    }

    const updateTask = (task: Task, data: Partial<TaskData>) => {
        updateIdbTask(task, data).then(taskUpdated => taskUpdated && dispatch({type: 'taskUpdated', task: taskUpdated}))
    }

    return (
        <div className={classNames('task card', className)}>
            <div className="card-body" onClick={() => onEdit?.(task)}>
                <h5 className="card-title">{task.name}</h5>
                {task.description && <p className="card-text">{task.description}</p>}
            </div>
            <div className="card-footer d-flex justify-content-between">
                <TaskStatus task={task} onChange={handleStatusChange} />
                <StopWatchTask name={task.name} onStart={startTimerHandler} onEnd={endTimerHandler} ref={stopWatchRef}
                               seconds={stopWatchSeconds} disabled={task.status === 'done'} />
            </div>
        </div>
    )
}