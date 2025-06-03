import {useEffect, useRef, useState} from "react";
import WebAudioPlayer, { statuses } from '@lib/audio/WebAudioPlayer';
import '@styles/components/music-player.css';

export default function MusicPlayer() {
    const [playButtonLabel, setPlayButtonLabel] = useState('▶ Play');
    const [statusLabel, setStatusLabel] = useState('Ready to play');
    const [progressBarStyle, setProgressBarStyle] = useState({width: '0%'});
    const [timeDisplay, setTimeDisplay] = useState('0:00 / 0:00')
    const player = useRef<WebAudioPlayer>(null);

    useEffect(() => {
        if (player.current) return;

        // player.current = new WebAudioPlayer('/audio/LaDanzadelMono-LosOrientales.mp3');
        player.current = new WebAudioPlayer('/audio/tirzah-micachu.webm');
        player.current.onStatusUpdate(status => {
            setStatusLabel(statuses[status]);
            if (status == 'playing') {
                setPlayButtonLabel('⏸ Pause');
            } else if (status === 'paused') {
                setPlayButtonLabel('▶ Resume');
            } else if (status === 'stopped') {
                setPlayButtonLabel('▶ Play');
            }
        });
        player.current.onProgressUpdate(progress => {
            setProgressBarStyle({width: `${progress}%`})
        });
        player.current.onTimeUpdate((currentTime, totalTime) => {
            setTimeDisplay(`${currentTime} / ${totalTime}`)
        })
    }, []);

    function handlePlay() {
        player.current.togglePlay();
    }

    return (
        <div className="player-container">
            <h2>Music Player</h2>
            <button className="player-button" onClick={handlePlay}>{playButtonLabel}</button>
            <div className="status">{statusLabel}</div>
            <div className="progress-container">
                <div className="progress-bar" style={progressBarStyle}></div>
            </div>
            <div className="time-display">{timeDisplay}</div>
        </div>
    )
}

export function Audio({ src } : { src: string }) {

    return <audio src={src} preload="auto" crossOrigin="anonymous" controls ></audio>
}