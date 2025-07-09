import { useContext, useEffect, useRef, useState } from "react";
import { StopWatchHandle } from "@components/StopWatch";
import { Task, TaskStatus as TypeTaskStatus, Timer } from "@type/Model";
import TaskStatus from "@components/Task/TaskStatus";
import TaskStopWatch from "@components/Task/TaskStopWatch";
import { TaskModalDispatch } from "@lib/state/task-modal-state";
import rem from "@lib/idb/rem";
import '@styles/components/task/task-card.scss'

export default function TaskCard({ taskId }: { taskId: number }) {
    const task = rem.tasks.getTask(taskId);
    const dispatch = useContext(TaskModalDispatch);
    const taskCurrentTimer = useRef<Timer>(null);
    const stopWatchRef = useRef<StopWatchHandle>(null);
    const [stopWatchSeconds, setStopWatchSeconds] = useState(task?.timersTotal ?? 0);
    const [endStatus, setEndStatus] = useState<TypeTaskStatus>('paused')

    useEffect(() => {
        if (task && task.status === 'inprogress' && !stopWatchRef.current.isRunning()) {
            stopWatchRef.current?.run();
        } else if (task && task.status !== 'inprogress' && stopWatchRef.current.isRunning()) {
            setEndStatus(task.status);
            stopWatchRef.current?.stop();
        }
    }, [task]);

    if (!task) return

    async function startTimerHandler(start: number) {
        taskCurrentTimer.current = await rem.tasksTimers.startTaskTimer(task.id, start);
        if (task.status !== 'inprogress') {
            updateTask({ status: 'inprogress' });
        }
    }
    async function endTimerHandler(end: number) {
        if (taskCurrentTimer.current) {
            const timersTotal = await rem.tasksTimers.stopTaskTimer(task.id, taskCurrentTimer.current.id, end, endStatus)
            setStopWatchSeconds(timersTotal)
        } else {
            updateTask({status: endStatus});
        }
        setEndStatus('paused');
    }

    const updateTask = (data: Partial<Task>) => {
        rem.tasks.updateTask(taskId, data).then(task => task && dispatch({type: 'taskUpdated', task}));
    }

    return (
        <div className='task card'>
            <div className="card-body" onClick={() => dispatch({type: 'taskModalOpened', task})}>
                <h5 className="card-title">{task.name}</h5>
                {task.description && <p className="card-text break-words-smart">{task.description}</p>}
            </div>
            <div className="card-footer d-flex justify-content-between">
                <TaskStatus value={task.status} onChange={status => updateTask({ status })} />
                <TaskStopWatch taskId={task.id} onStart={startTimerHandler} onEnd={endTimerHandler} ref={stopWatchRef}
                               seconds={stopWatchSeconds} disabled={task.status === 'done'} />
            </div>
        </div>
    );
}