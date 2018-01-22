"use strict";
class MultiVideoChat {
    constructor() {
        this.peer = [];
        this.index = 0;
        this.conposedStream = new MediaStream();
    }
    start() {
        this.setConposedScreen();
        this.peer[this.index] = new HandlePeer();
        this.peer[this.index].getUserMedia()
            .then((stream) => {
            console.log("getUserMedia");
            this.showVideoSelf(stream);
            this.audio = new HandleAudio(stream);
        })
            .catch((reason) => console.error(reason));
        this.peer[this.index].opened()
            .then((id) => {
            const container = document.getElementById("peerid");
            const idElement = document.createElement("span");
            idElement.textContent = id;
            container.insertAdjacentElement("beforeend", idElement);
        })
            .catch((reason) => console.error(reason));
        this.peer[this.index].error()
            .then((error) => console.error(error))
            .catch((reason) => console.error(reason));
        this.peer[this.index].called(this.conposedStream)
            .then((stream) => {
            this.showVideoFirst(stream);
            const audioStream = this.audio.addStream(stream);
            this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
            this.conposedStream.addTrack(audioStream.getAudioTracks()[0]);
            const video = document.getElementById("test");
            video.src = URL.createObjectURL(this.conposedStream);
            this.peer[this.index].answerStream(this.conposedStream);
        })
            .catch((reason) => console.error(reason));
        this.dissconnectEvent();
    }
    dissconnectEvent() {
        const dissconnectFirst = document.getElementById("dissconnectbutton");
        dissconnectFirst.addEventListener("click", () => {
            this.peer[this.index].reset();
        });
    }
    showVideoSelf(stream) {
        const video = document.getElementById("video-self");
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 0);
    }
    showVideoFirst(stream) {
        const video = document.getElementById("video-first");
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, this.index);
    }
    setCanvas(video, number) {
        const canvas = document.getElementById("conpose-canvas");
        const context = canvas.getContext("2d");
        const cx = canvas.width - ((number + 1) * video.width);
        const cy = (number % 4) * video.height;
        canvas.style.transform = "scaleX(-1)";
        context.drawImage(video, cx, cy, video.width, (video.width * video.videoHeight) / video.videoWidth);
        requestAnimationFrame(() => this.setCanvas(video, number));
    }
    setConposedScreen() {
        const canvas = document.getElementById("conpose-canvas");
        this.conposedVideo = canvas.captureStream();
        this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
        const conposed = document.getElementById("conposed-stream");
        conposed.src = URL.createObjectURL(this.conposedVideo);
    }
}
window.onload = () => {
    const multi = new MultiVideoChat();
    multi.start();
};
//# sourceMappingURL=MultiVideoChat.js.map