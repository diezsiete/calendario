import { useEffect, useRef, useState } from "react";
import TimerComponent from "@components/Timer";
import { Task, Timer } from "@type/Model";
import { getCompleteTaskTimers, getTimersTotal, startTaskTimer, stopTaskTimer } from '@lib/db/idb';
import { removeLocalTimer } from '@lib/db/local-timer';

type TaskCardProps = { task: Task, onEdit?: (task: Task) => void, onDelete?: (task: Task) => void };

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
    const taskCurrentTimer = useRef<Timer>(null);
    const [timerSeconds, setTimerSeconds] = useState(0);

    useEffect(() => {
        getCompleteTaskTimers(task).then(timers => setTimerSeconds(getTimersTotal(timers)))
    }, [task]);

    async function startTimerHandler() {
        taskCurrentTimer.current = await startTaskTimer(task);
    }

    async function endTimerHandler() {
        if (taskCurrentTimer.current) {
            taskCurrentTimer.current = await stopTaskTimer(task, taskCurrentTimer.current.id);
            removeLocalTimer(task.name);
        }
    }

    return (
        <div className='card'>
            <div className="card-body">
                <h5 className="card-title">{task.name}</h5>
                <p className="card-text">{task.description}</p>
                <button className="btn btn-outline-success" onClick={() => onEdit(task)}>
                    Edit
                </button>
                <button className="btn btn-outline-danger" onClick={() => onDelete(task)}>
                    Delete
                </button>
                <TimerComponent name={task.name} onStart={startTimerHandler} onEnd={endTimerHandler} seconds={timerSeconds}/>
            </div>
        </div>
    )
}


// function formatDuration(ms) {
//     const seconds = Math.floor(ms / 1000) % 60;
//     const minutes = Math.floor(ms / 60000) % 60;
//     const hours = Math.floor(ms / 3600000);
//     return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
// }
//
// function pad(n) {
//     return n.toString().padStart(2, '0');
// }