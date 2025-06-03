import { useEffect, useRef, useState } from "react";
import { StopWatchTask } from "@components/StopWatch";
import { Task, Timer } from "@type/Model";
import { getCompleteTaskTimers, getTimersTotal, startTaskTimer, stopTaskTimer} from '@lib/idb/tasks';
import '@styles/components/task/task-card.scss'
import classNames from "classnames";

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
        <div className={classNames('task card', className)} onClick={() => onEdit?.(task)}>
            <div className="card-body">
                <h5 className="card-title">{task.name}</h5>
                {task.description && <p className="card-text">{task.description}</p>}
                <StopWatchTask name={task.name} onStart={startTimerHandler} onEnd={endTimerHandler} seconds={timerSeconds} />
            </div>
        </div>
    )
}