class HandleAudio {
    private audioContext: AudioContext;
    private source: any;

    constructor(stream: MediaStream) {
        // const audioContext = new (window || window.webkitAudioContext)();
        this.audioContext = new window.AudioContext();
        this.source = this.audioContext.createMediaStreamSource(stream);
    }

    public addStream(stream: MediaStream): MediaStream {
        const addSource = this.audioContext.createMediaStreamSource(stream);
        const dest = this.audioContext.createMediaStreamDestination();
        this.source.connect(dest);
        addSource.connect(dest);
        return dest.stream;
    }
}