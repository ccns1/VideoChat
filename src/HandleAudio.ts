class HandleAudio {
    private audioContext: AudioContext;
    private dest: MediaStreamAudioDestinationNode;

    constructor() {
        this.audioContext = new window.AudioContext || new webkitAudioContext();
        this.dest = this.audioContext.createMediaStreamDestination();
    }

    public addStream(stream: MediaStream): MediaStream {
        const addSource = this.audioContext.createMediaStreamSource(stream);
        addSource.connect(this.dest);
        return this.dest.stream;
    }
}

export default HandleAudio;