import { useState } from "react";
import classNames from "classnames";
import EyeCareTimer from "@components/EyeCare/EyeCareTimer";
import PlaySong from "@components/EyeCare/PlaySong";

// workDuration={3000} restDuration={600}

export default function EyeCare({ className } : { className?: string }) {
    const [play, setPlay] = useState(false);

    return <>
        <div className={classNames('btn-group', className)}>
            <EyeCareTimer workDuration={3000} restDuration={600}
                          onAlternate={activeTimer => setPlay(activeTimer === 'rest')}>
                <i className="bi bi-eye me-2"></i>
            </EyeCareTimer>
            <PlaySong className='me-2' play={play} />
        </div>
    </>
}