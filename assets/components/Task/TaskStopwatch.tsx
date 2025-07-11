import classNames from "classnames";
import { formatSeconds } from "@lib/util/temporal";
import { useEffect, useState } from "react";
import taskStopwatchManager from "@lib/state/taskStopwatchManager";

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

export function NavbarTaskStopwatch({ ...stopwatchProps } : Omit<StopwatchProps, 'seconds'|'running'>) {
    const [stopwatchState, setStopwatchState] = useState({running: taskStopwatchManager.isRunning(), seconds: taskStopwatchManager.getTaskStopwatchTotal()})

    useEffect(() => {
        taskStopwatchManager
            .onRunning((running, seconds) => setStopwatchState({running, seconds}))
            .onSecond(seconds => setStopwatchState({running: true, seconds}));
        return () => {
            taskStopwatchManager.onRunning().onSecond()
        };
    }, []);

    return <Stopwatch running={stopwatchState.running} seconds={stopwatchState.seconds} {...stopwatchProps} />
}

function Stopwatch({ running, seconds, className, disabled, onClick }: StopwatchProps) {
    return (
        <button type="button" disabled={disabled} onClick={() => onClick?.()}
                className={classNames('btn', 'timer-button', running ? 'btn-primary-alt' : 'btn-outline-secondary', className)} >
            {formatSeconds(seconds ?? 0)}
        </button>
    )
}