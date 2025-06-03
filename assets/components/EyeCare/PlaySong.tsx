import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import TogglePlay from "@lib/audio/TogglePlay";

export default function PlaySong({ className, play = false } : { className?: string, play? : boolean }) {
    const [active, setActive] = useState(false);
    const togglePlayRef = useRef<TogglePlay>(null);
    useEffect(() => {
        if (!togglePlayRef.current) {
            togglePlayRef.current = new TogglePlay('/audio/LaDanzadelMono-LosOrientales.mp3')
            togglePlayRef.current.loadSong();
        }
        togglePlayRef.current.togglePlay(active);
    }, [active]);

    useEffect(() => {
        setActive(play);
    }, [play]);

    return (
        <button type="button" className={classNames('btn', className,  {
            'btn-outline-warning': !active,
            'btn-warning': active,
        })} onClick={() => setActive(prev => !prev)}>
            PlaySong
        </button>
    )
}