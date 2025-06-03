export default class TogglePlay {
    private context: AudioContext;
    private buffer: AudioBuffer;
    private source: AudioBufferSourceNode|null = null;
    private startTime = 0;     // When we started playing
    private pauseTime = 0;     // Where we paused
    private isPlaying = false;
    private isLoading = true;
    private afterLoadedQueue: Array<() => void> = [];

    constructor(
        private readonly songUrl: string
    ) {}

    async loadSong() {
        if (!this.context) {
            this.context = new window.AudioContext;
        }
        const response = await fetch(this.songUrl);
        const arrayBuffer = await response.arrayBuffer();
        this.buffer = await this.context.decodeAudioData(arrayBuffer);
        this.isLoading = false;
        while (this.afterLoadedQueue.length) {
            const afterLoadedCallback = this.afterLoadedQueue.shift();
            afterLoadedCallback();
        }
    }

    togglePlay(force?: boolean) {
        if (this.isLoading) {
            this.afterLoadedQueue.push(() => this.togglePlay(force))
            return;
        }
        if (force === true || (!this.isPlaying && force !== false)) {
            this.play();
        } else {
            this.pause();
        }
    }

    stop(): void {
        this.source?.stop();
        this.source?.disconnect();
        this.source = null;

        this.isPlaying = false;
        this.pauseTime = 0;
        this.startTime = 0;
    }

    private play() {
        // Resume from pause position
        const source = this.context.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.context.destination);
        source.start(0, this.pauseTime); // start at paused offset
        this.startTime = this.context.currentTime - this.pauseTime;
        this.isPlaying = true;
        this.source = source;

        source.onended = () => {
            this.source = null;
            if (this.isPlaying) {
                this.pauseTime = 0;
            }
        };
    }

    private pause() {
        if (this.source && this.isPlaying) {
            this.isPlaying = false;
            this.source.stop();
            this.source.disconnect();
            this.pauseTime = this.context.currentTime - this.startTime; // Save where we paused
        }
    }
}