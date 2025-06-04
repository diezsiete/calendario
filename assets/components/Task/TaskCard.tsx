import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { StopWatchTask } from "@components/StopWatch";
import { Task, Timer } from "@type/Model";
import { getCompleteTaskTimers, getTimersTotal, startTaskTimer, stopTaskTimer} from '@lib/idb/tasks';
import '@styles/components/task/task-card.scss'
import TaskStatus from "@components/Task/TaskStatus";

type TaskCardProps = { task: Task, className?: string, onEdit?: (task: Task) => void };

export default function TaskCard({ task, className, onEdit }: TaskCardProps) {
    const taskCurrentTimer = useRef<Timer>(null);
    const [timerSeconds, setTimerSeconds] = useState(0);

    useEffect(() => {
        getCompleteTaskTimers(task).then(timers => setTimerSeconds(getTimersTotal(timers)))
    }, [task]);

    async function startTimerHandler(start: number) {
        taskCurrentTimer.current = await startTaskTimer(task, start);
    }

    async function endTimerHandler(end: number) {
        if (taskCurrentTimer.current) {
            taskCurrentTimer.current = await stopTaskTimer(task, taskCurrentTimer.current.id, end);
            setTimerSeconds(prev => prev + (end - taskCurrentTimer.current.start));
        }
    }

    return (
        <div className={classNames('task card', className)}>
            <div className="card-body" onClick={() => onEdit?.(task)}>
                <h5 className="card-title">{task.name}</h5>
                {task.description && <p className="card-text">{task.description}</p>}
            </div>
            <div className="card-footer d-flex justify-content-between">
                <StopWatchTask name={task.name} onStart={startTimerHandler} onEnd={endTimerHandler}
                               seconds={timerSeconds}/>
                <TaskStatus task={task} />
            </div>
        </div>
    )
}