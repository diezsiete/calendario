import { MouseEvent, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import {getLocalTimer, removeLocalTimer, setLocalTimer} from '@lib/db/local-timer';
import { formatSeconds } from "@lib/varchar";

type StopWatchProps = {
    seconds?: number,
    onStart?: (start: number) => void,
    onEnd?: (end: number) => void,
    onSecond?: (elapsedTime: number) => void,
    className?: string
};
type StopWatchTaskProps = { name: string } & Omit<StopWatchProps, 'onSecond'>;

export default function StopWatch({ seconds, onStart, onEnd, onSecond, className }: StopWatchProps) {
    const initialSeconds = useRef(seconds ?? 0);
    const [elapsedTime, setElapsedTime] = useState(seconds ?? 0);
    const [isRunning, setIsRunning] = useState(false);
    const startTime = useRef(Date.now());
    const stopRef = useRef(false);
    const onEndRef = useRef(onEnd);
    const onSecondRef = useRef(onSecond);

    useEffect(() => {
        onEndRef.current = onEnd
    }, [onEnd]);
    useEffect(() => {
        onSecondRef.current = onSecond
    }, [onSecond]);

    useEffect(() => {
        setElapsedTime(seconds ?? 0);
        initialSeconds.current = seconds ?? 0;
    }, [seconds]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const newElapsedTime = Math.floor((now - startTime.current) / 1000) + initialSeconds.current;
            setElapsedTime(newElapsedTime);
            onSecondRef.current?.(newElapsedTime);
            if (stopRef.current) {
                setIsRunning(false);
                clearInterval(interval);
                stopRef.current = false;
                onEndRef.current?.(Math.floor(now / 1000));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning]);

    const toggleTimer = (e: MouseEvent) => {
        e.stopPropagation();
        if (!isRunning) {
            startTime.current = Date.now();
            onStart?.(Math.floor(startTime.current / 1000));
            setIsRunning(true);
        } else {
            stopRef.current = true;
        }
    };

    return (
        <button type="button" className={classNames('btn', 'timer-button', {
            'btn-primary' : isRunning,
            'btn-outline-secondary' : !isRunning,
        }, className)} onClick={toggleTimer}>
            {formatSeconds(elapsedTime)}
        </button>
    )
}

export function StopWatchTask(props: StopWatchTaskProps) {
    const { name, onEnd, ...stopWatchProps } = props;

    function secondHandler(elapsedTime: number) {
        setLocalTimer(name, elapsedTime);
    }

    function endHandler(end: number) {
        removeLocalTimer(name);
        onEnd?.(end);
    }

    return <StopWatch onSecond={secondHandler} onEnd={endHandler} {...stopWatchProps} />
}

export function StopWatchLocalStorage({ name, className } : { name: string, className?: string }) {
    const [seconds, setSeconds] = useState(0);
    const start = useRef(0)

    useEffect(() => setSeconds(getLocalTimer(name) ?? 0), [name]);

    const startHandler = (now: number) => start.current = now;

    const secondHandler = (elapsedTime: number) => setLocalTimer(name, elapsedTime);

    const endHandler = (end: number) => setSeconds(prev => prev + (end - start.current));

    return <StopWatch seconds={seconds} onStart={startHandler} onSecond={secondHandler} onEnd={endHandler} className={className}  />
}