"use strict";
class MultiVideoChat {
    constructor() {
        this.peer = [];
        this.audio = new HandleAudio();
        this.conposedStream = new MediaStream();
    }
    start(index) {
        this.getComposeCanvas();
        this.peer[index] = new HandlePeer();
        this.peer[index].opened()
            .then((id) => {
            const container = document.getElementById("peerid");
            const idElement = document.createElement("div");
            idElement.textContent = id;
            container.insertAdjacentElement("beforeend", idElement);
        })
            .catch((reason) => console.error(reason));
        this.peer[index].error()
            .then((error) => console.error(error))
            .catch((reason) => console.error(reason));
    }
    showSelf(index) {
        this.peer[index].getUserMedia()
            .then((stream) => {
            this.showVideoSelf(stream);
            this.audio.addStream(stream);
        })
            .catch((reason) => console.error(reason));
    }
    waitToCall(index) {
        this.peer[index].called(this.conposedStream)
            .then((stream) => {
            this.setStreamForCanvas(index, stream);
            const audioStream = this.audio.addStream(stream);
            this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
            this.conposedStream.addTrack(audioStream.getAudioTracks()[0]);
        })
            .catch((reason) => console.error(reason));
        this.dissconnectEvent(index);
    }
    dissconnectEvent(index) {
        const dissconnectFirst = document.getElementById("dissconnectbutton");
        dissconnectFirst.addEventListener("click", () => {
            this.peer[index].reset();
        });
    }
    showVideoSelf(stream) {
        const video = document.getElementById("video-self");
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 0);
    }
    setStreamForCanvas(index, stream) {
        const videoElement = document.createElement("video");
        videoElement.setAttribute("autoplay", "autoplay");
        videoElement.setAttribute("width", "200");
        videoElement.src = URL.createObjectURL(stream);
        const container = document.getElementById("video");
        container.insertAdjacentElement("beforeend", videoElement);
        this.setCanvas(videoElement, index + 1);
    }
    setCanvas(video, number) {
        const canvas = document.getElementById("conpose-canvas");
        const context = canvas.getContext("2d");
        const cx = canvas.width - ((number + 1) * video.width);
        const cy = (number % 4) * video.height;
        canvas.style.transform = "scaleX(-1)";
        context.fillStyle = "#f5f5f5";
        context.drawImage(video, cx, cy, video.width, (video.width * video.videoHeight) / video.videoWidth);
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
    let index = 0;
    const multi = new MultiVideoChat();
    multi.start(index);
    multi.showSelf(index);
    multi.waitToCall(index);
};
//# sourceMappingURL=MultiVideoChat.js.map