import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { getLocalTimer, setLocalTimer } from '@lib/db/local-timer';

type TimerProps = { name: string, onStart?: () => void, onEnd?: () => void, seconds?: number};

export default function Timer({ name, onStart, onEnd, seconds }: TimerProps) {
    const nameRef = useRef(name);
    const [localSeconds, setLocalSeconds] = useState(seconds || 0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);
    const onStartRef = useRef(onStart);
    const onEndRef = useRef(onEnd);
    const stopRequestedRef = useRef(false);

    useEffect(() => {
        onStartRef.current = onStart
    }, [onStart]);
    useEffect(() => {
        onEndRef.current = onEnd
    }, [onEnd]);

    useEffect(() => {
        if (seconds) {
            setLocalTimer(nameRef.current, seconds);
        }
        setLocalSeconds(getLocalTimer(nameRef.current) ?? 0)
    }, [seconds]);


    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setLocalSeconds(prev => {
                    const current = prev + 1;
                    setLocalTimer(nameRef.current, current);
                    return current;
                });
                if (stopRequestedRef.current) {
                    setIsRunning(false);
                    clearInterval(intervalRef.current);
                    stopRequestedRef.current = false;
                    onEndRef.current?.();
                }
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const toggleTimer = () => {
        if (!isRunning) {
            onStartRef.current?.();
            setIsRunning(true);
        } else {
            stopRequestedRef.current = true;
        }
    };

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <button type="button" className={classNames('btn', 'btn-lg', {
            'btn-primary' : isRunning,
            'btn-secondary' : !isRunning,
        })} onClick={toggleTimer}>
            {formatTime(localSeconds)}
        </button>
    )
}