class HandleAudio {
    private audioContext: AudioContext;
    private dest: MediaStreamAudioDestinationNode;

    constructor() {
        // const audioContext = new (window || window.webkitAudioContext)();
        this.audioContext = new window.AudioContext();
        this.dest = this.audioContext.createMediaStreamDestination();
    }

    public addStream(stream: MediaStream): MediaStream {
        const addSource = this.audioContext.createMediaStreamSource(stream);
        addSource.connect(this.dest);
        return this.dest.stream;
    }
}