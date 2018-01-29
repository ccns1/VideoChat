"use strict";
class HandleAudio {
    constructor() {
        this.audioContext = new window.AudioContext();
        this.dest = this.audioContext.createMediaStreamDestination();
    }
    addStream(stream) {
        const addSource = this.audioContext.createMediaStreamSource(stream);
        addSource.connect(this.dest);
        return this.dest.stream;
    }
}
//# sourceMappingURL=HandleAudio.js.map