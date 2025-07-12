import { useCallback, useContext, useEffect, useState } from "react";
import classNames from "classnames";
import rem from "@lib/idb/rem";
import taskStopwatchManager from "@lib/state/taskStopwatchManager";
import { DbContext } from "@components/Db/DbContextProvider";
import { TaskModalContext } from "@lib/state/task-modal-state";
import { formatSeconds } from "@lib/util/temporal";
import '@styles/components/task/task-stopwatch.scss';

type StopwatchProps = { running: boolean, seconds?: number, className?: string, disabled?: boolean, onClick?: () => void }
type TaskStopwatchProps = { taskId: number, onRunning?: (running: boolean) => void } & Omit<StopwatchProps, 'seconds'|'running'|'onClick'>;

export default function TaskStopwatch({ taskId, onRunning, ...stopwatchProps } : TaskStopwatchProps) {
    const [running, setRunning] = useState(taskStopwatchManager.isRunning(taskId));
    const [seconds, setSeconds] = useState(taskStopwatchManager.getTaskStopwatchTotal(taskId));

    useEffect(() => {
        taskStopwatchManager
            .onRunning(taskId, running => {
                setRunning(running);
                onRunning?.(running);
            })
            .onSecond(taskId, seconds => setSeconds(seconds))
    }, [taskId, onRunning]);

    function handleClick() {
        taskStopwatchManager.toggleRunning(taskId);
    }

    return <Stopwatch running={running} seconds={seconds} onClick={handleClick} {...stopwatchProps} />
}

export function NavbarTaskStopwatch({ className } : { className?: string }) {
    const taskContext = useContext(TaskModalContext);
    const dbContext = useContext(DbContext);
    const [running, setRunning] = useState(taskStopwatchManager.isRunning());
    const [seconds, setSeconds] = useState(taskStopwatchManager.getLastTaskStopwatchTotal());
    const [taskId, setTaskId] = useState(taskStopwatchManager.getLastTaskRunning());

    const clear = useCallback(() => {
        setTaskId(null);
        setSeconds(0)
        taskStopwatchManager.lastTaskRunning.remove()
    }, [])

    useEffect(() => {
        taskStopwatchManager
            .onRunning((running, seconds, taskId) => {
                setRunning(running);
                setTaskId(taskId);
                if (running) {
                    setSeconds(seconds);
                }
            })
            .onSecond(seconds => setSeconds(seconds));
        return () => {
            taskStopwatchManager.onRunning().onSecond()
        };
    }, []);

    useEffect(() => {
        if (taskContext.dateUpd && taskId && taskContext.task.id === taskId && !taskContext.taskPrev && !rem.tasks.getTask(taskId)) {
            clear();
        }
    }, [dbContext, taskContext.dateUpd, taskId, taskContext.task.id, taskContext.taskPrev, clear]);
    useEffect(() => {
        if (dbContext) {
            clear();
        }
    }, [dbContext, clear]);

    function handleClick() {
        if (taskStopwatchManager.isRunning()) {
            taskStopwatchManager.stop();
        } else if (taskId) {
            taskStopwatchManager.start(taskId);
        }
    }

    const taskName = rem.tasks.getTask(taskId)?.name ?? null;

    return (
        <div className={classNames('input-group navbar-task-stopwatch', className, {running})}>
            {taskName && <div className="input-group-text"><span>{taskName}</span></div>}
            <Stopwatch running={running} seconds={seconds} disabled={!taskId} onClick={handleClick}/>
        </div>
    )
}

function Stopwatch({running, seconds, className, disabled, onClick }: StopwatchProps) {
    return (
        <button type="button" disabled={disabled} onClick={() => onClick?.()}
                className={classNames('btn', 'timer-button', running ? 'btn-primary-alt' : 'btn-outline-secondary', className)} >
            {formatSeconds(seconds ?? 0)}
        </button>
    )
}