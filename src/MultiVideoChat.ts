class MultiVideoChat {
    private peer: Array<HandlePeer> = [];
    private index: number = 0;
    private context: any;
    private conposedVideo: MediaStream;
    private audio: HandleAudio;
    private conposedStream = new MediaStream();

    public start() {
        //受け取ったストリームを画面をcanvasに出力する
        this.setConposedScreen();

        this.peer[this.index] = new HandlePeer();

        this.peer[this.index].getUserMedia()
            .then((stream: any) => {
                console.log("getUserMedia");
                this.showVideoSelf(stream);
                this.audio = new HandleAudio(stream);
            })
            .catch((reason: any) => console.error(reason));

        this.peer[this.index].opened()
            .then((id: any) => {
                const container = <HTMLElement>document.getElementById("peerid");
                const idElement = document.createElement("span");
                idElement.textContent = id;
                container.insertAdjacentElement("beforeend", idElement);
            })
            .catch((reason: any) => console.error(reason));

        this.peer[this.index].error()
            .then((error: any) => console.error(error))
            .catch((reason: any) => console.error(reason));

        this.peer[this.index].called(this.conposedStream)
            .then((stream: MediaStream) => {
                this.showVideoFirst(stream);
                const audioStream = this.audio.addStream(stream);
                this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
                this.conposedStream.addTrack(audioStream.getAudioTracks()[0]);

                //fix 合成したストリームを表示する
                const video = <HTMLVideoElement>document.getElementById("test");
                video.src = URL.createObjectURL(this.conposedStream);

                //todo 2度返す
                this.peer[this.index].answerStream(this.conposedStream);
            })
            .catch((reason: any) => console.error(reason));

        this.dissconnectEvent();
    }

    private dissconnectEvent() {
        const dissconnectFirst: HTMLInputElement = <HTMLInputElement>document.getElementById("dissconnectbutton");
        dissconnectFirst.addEventListener("click", () => {
            this.peer[this.index].reset();
        });
    }

    // todo allquery
    private showVideoSelf(stream: MediaStream) {
        const video = <HTMLVideoElement>document.getElementById("video-self");
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 0);
    }

    private showVideoFirst(stream: MediaStream) {
        const video = <HTMLVideoElement>document.getElementById("video-first");
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 1);
    }

    private setCanvas(video: HTMLVideoElement, number: number) {
        const canvas: any = document.getElementById("conpose-canvas");
        const context = <CanvasRenderingContext2D>canvas.getContext("2d");
        const cx = canvas.width - ((number + 1) * video.width);
        const cy = (number % 4) * video.height;

        canvas.style.transform = "scaleX(-1)";
        context.drawImage(video, cx, cy, video.width, (video.width * video.videoHeight) / video.videoWidth);
        requestAnimationFrame(() => this.setCanvas(video, number));
    }

    private setConposedScreen() {
        const canvas: any = <HTMLCanvasElement>document.getElementById("conpose-canvas");
        this.conposedVideo = canvas.captureStream();
        this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);

        const conposed = <HTMLVideoElement>document.getElementById("conposed-stream");
        conposed.src = URL.createObjectURL(this.conposedVideo);
    }
}

window.onload = () => {
    const multi: MultiVideoChat = new MultiVideoChat();
    multi.start();
};
