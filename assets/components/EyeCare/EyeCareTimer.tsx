import { ReactNode, useEffect, useRef, useState } from "react";
import TimerWorker from "@lib/clock/TimerWorker";
import classNames from "classnames";
import { formatMinutes } from "@lib/varchar";

type ActiveTimer = 'work'|'rest';
type EyeCareTimerProps = {
    workDuration: number,
    restDuration: number,
    className?: string,
    onAlternate?: (activeTimer?: ActiveTimer) => void,
    children?: ReactNode
};

export default function EyeCareTimer(props: EyeCareTimerProps) {
    const timerWorker = useRef<TimerWorker>(null);
    const onAlternateRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const [activeTimer, setActiveTimer] = useState<ActiveTimer>('work');
    const [currentTime, setCurrentTime] = useState(props.workDuration);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        onAlternateRef.current = props.onAlternate
    }, [props.onAlternate]);

    useEffect(() => {
        if (timerWorker.current) return;
        try {
            timerWorker.current = new TimerWorker()
                .onSecondChange(second => setCurrentTime(second))
                .onEnd(name => {
                    const newActiveTimer = name === 'work' ? 'rest' : 'work';
                    const duration = newActiveTimer === 'work' ? props.workDuration : props.restDuration;
                    onAlternateRef.current?.(newActiveTimer)
                    setActiveTimer(newActiveTimer);
                    setCurrentTime(duration);
                    timerWorker.current.startTimer(newActiveTimer, duration)
                });
        } catch (e) {
            setDisabled(true);
            console.error(e.message)
        }
        return () => {
            timerWorker.current?.terminate();
            timerWorker.current = null;
        }
    }, [props.workDuration, props.restDuration]);

    const toggleTimer = () => {
        if (isRunning) { // Stop the timer
            setIsRunning(false);
            onAlternateRef.current?.()
            timerWorker.current?.stopTimer();
        } else { // Start the timer
            onAlternateRef.current?.(activeTimer)
            timerWorker.current?.startTimer(activeTimer, activeTimer === 'work' ? props.workDuration : props.restDuration)
            setIsRunning(true);
        }
    };

    // Reset timer when stopped
    useEffect(() => {
        if (!isRunning) {
            setActiveTimer('work');
            setCurrentTime(props.workDuration);
        }
    }, [isRunning, props.workDuration])

    return <button type="button" onClick={toggleTimer} disabled={disabled} className={classNames('btn timer-button', props.className, {
        'btn-outline-success': !isRunning,
        'btn-success': isRunning && activeTimer === 'work',
        'btn-danger': isRunning && activeTimer === 'rest',
    })}>
        {props.children}
        {formatMinutes(currentTime)}
    </button>
}