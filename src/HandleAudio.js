"use strict";
class HandleAudio {
    constructor(stream) {
        this.audioContext = new window.AudioContext();
        this.source = this.audioContext.createMediaStreamSource(stream);
    }
    addStream(stream) {
        const addSource = this.audioContext.createMediaStreamSource(stream);
        const dest = this.audioContext.createMediaStreamDestination();
        this.source.connect(dest);
        addSource.connect(dest);
        return dest.stream;
    }
}
//# sourceMappingURL=HandleAudio.js.map