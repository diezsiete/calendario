import StopWatch, { StopWatchProps } from "@components/StopWatch";
import { removeTaskLocalTimer, setTaskLocalTimer } from "@lib/db/local-timer";

type StopWatchTaskProps = { taskId: number } & Omit<StopWatchProps, 'onSecond'>;

export default function TaskStopWatch(props: StopWatchTaskProps) {
    const { taskId, onEnd, ...stopWatchProps } = props;

    function secondHandler(elapsedTime: number) {
        setTaskLocalTimer(taskId, elapsedTime);
    }

    function endHandler(end: number) {
        removeTaskLocalTimer(taskId);
        onEnd?.(end);
    }

    return <StopWatch onSecond={secondHandler} onEnd={endHandler} {...stopWatchProps} />
}