import StopWatch, { StopWatchProps } from "@components/StopWatch";
import rem from "@lib/idb/rem";

type StopWatchTaskProps = { taskId: number } & Omit<StopWatchProps, 'onSecond'>;

export default function TaskStopWatch(props: StopWatchTaskProps) {
    const { taskId, onStart, onEnd, ...stopWatchProps } = props;

    function secondHandler(elapsedTime: number) {
        rem.tasksTimers.local.set(taskId, elapsedTime);
    }

    function startHandler(start: number) {
        rem.tasksTimers.local.set(taskId, 0);
        onStart?.(start);
    }
    function endHandler(end: number) {
        rem.tasksTimers.local.remove(taskId);
        onEnd?.(end);
    }

    return <StopWatch onSecond={secondHandler} onStart={startHandler} onEnd={endHandler} {...stopWatchProps} />
}