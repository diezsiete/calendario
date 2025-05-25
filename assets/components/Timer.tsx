import { useEffect, useRef, useState } from "react";

export default function Timer({name}: {name: string}) {
    const [seconds, setSeconds] = useState(() => {
        const saved = localStorage.getItem(name);
        return saved ? parseInt(saved, 10) : 0;
    });
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => setSeconds(prev => {
                const current = prev + 1;
                localStorage.setItem(name, current + '');
                return current;
            }), 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const toggleTimer = () => setIsRunning(!isRunning);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <button type="button" className="btn btn-primary btn-lg" onClick={toggleTimer}>
            {formatTime(seconds)}
        </button>
    )
}