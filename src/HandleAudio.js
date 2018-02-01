"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HandleAudio {
    constructor() {
        this.audioContext = new window.AudioContext || new webkitAudioContext();
        this.dest = this.audioContext.createMediaStreamDestination();
    }
    addStream(stream) {
        const addSource = this.audioContext.createMediaStreamSource(stream);
        addSource.connect(this.dest);
        return this.dest.stream;
    }
}
exports.default = HandleAudio;
//# sourceMappingURL=HandleAudio.js.map