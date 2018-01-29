"use strict";
class MultiVideoChat {
    constructor() {
        this.peer = [];
        this.index = 0;
        this.audio = new HandleAudio();
        this.conposedStream = new MediaStream();
    }
    start() {
        this.getComposeCanvas();
        this.peer[this.index] = new HandlePeer();
        this.peer[this.index].opened()
            .then((id) => {
            const container = document.getElementById("peerid");
            const idElement = document.createElement("div");
            idElement.textContent = id;
            container.insertAdjacentElement("beforeend", idElement);
        })
            .catch((reason) => console.error(reason));
        this.peer[this.index].error()
            .then((error) => console.error(error))
            .catch((reason) => console.error(reason));
    }
    showSelf() {
        this.peer[this.index].getUserMedia()
            .then((stream) => {
            this.showVideoSelf(stream);
            this.audio.addStream(stream);
        })
            .catch((reason) => console.error(reason));
    }
    waitToCall() {
        this.peer[this.index].called(this.conposedStream)
            .then((stream) => {
            this.setStreamForCanvas(this.index, stream);
            const audioStream = this.audio.addStream(stream);
            this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
            this.conposedStream.addTrack(audioStream.getAudioTracks()[0]);
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
    setStreamForCanvas(index, stream) {
        const name = document.createElement("span");
        name.textContent = `stream${index}`;
        const videoElement = document.createElement("video");
        videoElement.setAttribute("autoplay", "autoplay");
        videoElement.setAttribute("width", "200");
        videoElement.src = URL.createObjectURL(stream);
        const container = document.getElementById("video");
        container.insertAdjacentElement("beforeend", name);
        container.insertAdjacentElement("beforeend", videoElement);
        this.setCanvas(videoElement, index + 1);
    }
    setCanvas(video, number) {
        const canvas = document.getElementById("conpose-canvas");
        const context = canvas.getContext("2d");
        const cx = 800 - ((number + 1) * 200);
        const cy = 0;
        canvas.style.transform = "scaleX(-1)";
        context.drawImage(video, cx, cy, 200, 200);
        requestAnimationFrame(() => this.setCanvas(video, number));
    }
    getComposeCanvas() {
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
    multi.showSelf();
    multi.waitToCall();
};
//# sourceMappingURL=MultiVideoChat.js.map