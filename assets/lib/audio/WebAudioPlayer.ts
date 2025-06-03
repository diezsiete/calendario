export const statuses = {
    'ready': 'Audio loaded - Ready to play',
    'playing' : 'Playing...',
    'paused' : 'Paused',
    'stopped': 'Stopped',
    'errorLoading': 'Error loading audio file',
    'errorPlaying': 'Error playing audio',
};

export default class WebAudioPlayer {
    private audioUrl: string;
    private audioContext: AudioContext | null = null;
    private audioBuffer: AudioBuffer | null = null;
    private source: AudioBufferSourceNode | null = null;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private startTime: number = 0;
    private pauseTime: number = 0;
    private duration: number = 0;
    private progressInterval: number | null = null;

    private listeners = {
        statusUpdate: null,
        progressUpdate: null,
        timeUpdate: null,
    };

    constructor(audioUrl: string) {
        this.audioUrl = audioUrl;
        this.init();
    }

    onStatusUpdate(listener: (status: keyof typeof statuses) => void) {
        this.listeners.statusUpdate = listener;
    }
    onProgressUpdate(listener: (progress: number) => void) {
        this.listeners.progressUpdate = listener;
    }
    onTimeUpdate(listener: (currentTime: string, totalTime: string) => void) {
        this.listeners.timeUpdate = listener;
    }

    private async init(): Promise<void> {
        try {
            // Create audio context
            this.audioContext = new window.AudioContext;

            // Load and decode audio file
            await this.loadAudio();

            this.updateStatus('ready');
            this.updateTimeDisplay();

        } catch (error) {
            console.error('Error initializing audio player:', error);
            this.updateStatus('errorLoading');
        }
    }

    private async loadAudio(): Promise<void> {
        if (!this.audioContext) {
            throw new Error('Audio context not initialized');
        }

        try {
            const response = await fetch(this.audioUrl);
            const arrayBuffer = await response.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.duration = this.audioBuffer.duration;
        } catch (error) {
            throw new Error('Failed to load audio: ' + (error as Error).message);
        }
    }

    togglePlay(): void {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    private play(): void {
        if (!this.audioContext || !this.audioBuffer) {
            console.error('Audio context or buffer not ready');
            return;
        }

        try {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            // Create new source
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = this.audioBuffer;
            this.source.connect(this.audioContext.destination);

            // Set up ended event
            this.source.onended = () => {
                if (this.isPlaying) {
                    this.stop();
                }
            };

            // Calculate start position
            const offset = this.isPaused ? this.pauseTime : 0;

            // Start playing
            this.source.start(0, offset);
            this.startTime = this.audioContext.currentTime - offset;
            this.isPlaying = true;
            this.isPaused = false;

            // Update UI
            this.updateStatus('playing');

            // Start progress update
            this.startProgressUpdate();

        } catch (error) {
            console.error('Error playing audio:', error);
            this.updateStatus('errorPlaying');
        }
    }

    private pause(): void {
        if (!this.audioContext || !this.source || !this.isPlaying) {
            return;
        }

        // Calculate current position
        this.pauseTime = this.audioContext.currentTime - this.startTime;

        // Stop the source
        this.source.stop();
        this.source = null;

        this.isPlaying = false;
        this.isPaused = true;

        // Update UI
        this.updateStatus('paused');

        // Stop progress update
        this.stopProgressUpdate();
    }

    private stop(): void {
        if (this.source) {
            this.source.stop();
            this.source = null;
        }

        this.isPlaying = false;
        this.isPaused = false;
        this.pauseTime = 0;
        this.startTime = 0;

        // Update UI
        this.updateStatus('stopped');
        this.listeners.progressUpdate?.(0);
        this.updateTimeDisplay();

        // Stop progress update
        this.stopProgressUpdate();
    }

    private getCurrentTime(): number {
        if (!this.audioContext) return 0;

        if (this.isPlaying) {
            return this.audioContext.currentTime - this.startTime;
        } else if (this.isPaused) {
            return this.pauseTime;
        }
        return 0;
    }

    private startProgressUpdate(): void {
        this.progressInterval = window.setInterval(() => {
            const currentTime = this.getCurrentTime();
            const progress = (currentTime / this.duration) * 100;
            this.listeners.progressUpdate?.(Math.min(progress, 100));
            this.updateTimeDisplay();
        }, 100);
    }

    private stopProgressUpdate(): void {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    private updateStatus(status: keyof typeof statuses): void {
        this.listeners.statusUpdate?.(status);
        // this.elements.status.textContent = status;
    }

    private updateTimeDisplay(): void {
        const currentTime = this.getCurrentTime();
        const currentMinutes = Math.floor(currentTime / 60);
        const currentSeconds = Math.floor(currentTime % 60);
        const totalMinutes = Math.floor(this.duration / 60);
        const totalSeconds = Math.floor(this.duration % 60);

        const currentTimeStr = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
        const totalTimeStr = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;

        this.listeners.timeUpdate?.(currentTimeStr, totalTimeStr);
    }

    // Public methods for external control
    public playAudio(): void {
        if (!this.isPlaying) {
            this.play();
        }
    }

    public pauseAudio(): void {
        if (this.isPlaying) {
            this.pause();
        }
    }

    public stopAudio(): void {
        this.stop();
    }

    public getIsPlaying(): boolean {
        return this.isPlaying;
    }

    public getIsPaused(): boolean {
        return this.isPaused;
    }

    public getCurrentPosition(): number {
        return this.getCurrentTime();
    }

    public getDuration(): number {
        return this.duration;
    }
}