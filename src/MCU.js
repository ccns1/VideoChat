"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HandlePeer_1 = require("./HandlePeer");
const HandleAudio_1 = require("./HandleAudio");
class MultiVideoChat {
    constructor() {
        this.peer = [];
        this.index = 0;
        this.audio = new HandleAudio_1.default();
        this.conposedStream = new MediaStream();
    }
    start() {
        this.getComposeCanvas();
        this.peer[this.index] = new HandlePeer_1.default();
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
            this.setSelfStreamForCanvas(stream);
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
            this.index++;
            this.start();
            this.showSelf();
            this.waitToCall();
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
    setSelfStreamForCanvas(stream) {
        const video = document.getElementById("video-self");
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 0);
    }
    setStreamForCanvas(number, stream) {
        const videoElement = document.createElement("video");
        videoElement.setAttribute("autoplay", "autoplay");
        videoElement.setAttribute("width", "200");
        videoElement.src = URL.createObjectURL(stream);
        const container = document.getElementById("video");
        container.insertAdjacentElement("beforeend", videoElement);
        this.setCanvas(videoElement, number + 1);
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
//# sourceMappingURL=MCU.js.map