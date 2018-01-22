"use strict";
class MultiVideoChat {
    constructor() {
        this.conposedStream = new MediaStream();
    }
    start() {
        this.setConposedScreen();
        this.firstPeer = new HandlePeer();
        this.firstPeer.getUserMedia()
            .then((stream) => {
            console.log("getUserMedia");
            this.showVideoSelf(stream);
            this.audio = new HandleAudio(stream);
        })
            .catch((reason) => console.error(reason));
        this.firstPeer.opened()
            .then((id) => {
            const idElement = document.getElementById("peerid-first");
            idElement.innerHTML = id;
        })
            .catch((reason) => console.error(reason));
        this.firstPeer.error()
            .then((error) => console.error(error))
            .catch((reason) => console.error(reason));
        this.firstPeer.called(this.conposedStream)
            .then((stream) => {
            this.showVideoFirst(stream);
            const audioStream = this.audio.addStream(stream);
            this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
            this.conposedStream.addTrack(audioStream.getAudioTracks()[0]);
            const video = document.getElementById("test");
            video.src = URL.createObjectURL(this.conposedStream);
            this.firstPeer.answerStream(this.conposedStream);
        })
            .catch((reason) => console.error(reason));
        this.loginEvent();
        this.dissconnectEvent();
    }
    loginEvent() {
        const login = document.getElementById("loginbutton");
        login.addEventListener("click", () => {
            const nameElement = document.getElementById("name");
            const name = nameElement.value;
            if (name) {
                this.firstPeer.setName(name);
                const namebox = document.getElementById("namebox");
                namebox.innerHTML = name;
            }
        });
    }
    dissconnectEvent() {
        const dissconnectFirst = document.getElementById("dissconnectbutton");
        dissconnectFirst.addEventListener("click", () => {
            this.firstPeer.reset();
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
        this.setCanvas(video, 1);
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
    setVisible(id, visible) {
        const element = document.getElementById(id);
        visible ? element.style.display = "block" : element.style.display = "none";
    }
}
window.onload = () => {
    const multi = new MultiVideoChat();
    multi.start();
};
//# sourceMappingURL=MultiVideoChat.js.map