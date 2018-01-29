class MultiVideoChat {
    private peer: Array<HandlePeer> = [];
    private conposedVideo: MediaStream;
    private audio = new HandleAudio();
    private conposedStream = new MediaStream();

    public start(index: number) {
        //canvasをstreamとして取得する
        this.getComposeCanvas();

        this.peer[index] = new HandlePeer();
        this.peer[index].opened()
            .then((id: any) => {
                const container = <HTMLElement>document.getElementById("peerid");
                const idElement = document.createElement("div");
                idElement.textContent = id;
                container.insertAdjacentElement("beforeend", idElement);
            })
            .catch((reason: any) => console.error(reason));

        this.peer[index].error()
            .then((error: any) => console.error(error))
            .catch((reason: any) => console.error(reason));
    }

    public showSelf(index: number) {
        this.peer[index].getUserMedia()
            .then((stream: MediaStream) => {
                this.showVideoSelf(stream);
                this.audio.addStream(stream);
            })
            .catch((reason: any) => console.error(reason));
    }

    public waitToCall(index: number) {
        this.peer[index].called(this.conposedStream)
            .then((stream: MediaStream) => {
                this.setStreamForCanvas(index, stream);
                const audioStream = this.audio.addStream(stream);
                this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
                this.conposedStream.addTrack(audioStream.getAudioTracks()[0]);

                //todo 2度返す
                // this.peer[index].answerStream(this.conposedStream);
            })
            .catch((reason: any) => console.error(reason));

        this.dissconnectEvent(index);
    }

    private dissconnectEvent(index: number) {
        const dissconnectFirst: HTMLInputElement = <HTMLInputElement>document.getElementById("dissconnectbutton");
        dissconnectFirst.addEventListener("click", () => {
            this.peer[index].reset();
        });
    }

    private showVideoSelf(stream: MediaStream) {
        const video = <HTMLVideoElement>document.getElementById("video-self");
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 0);
    }

    private setStreamForCanvas(index: number, stream: MediaStream) {
        const name = <HTMLElement>document.createElement("span");
        name.textContent = `stream${index}`;
        const videoElement = <HTMLVideoElement>document.createElement("video");
        videoElement.setAttribute("autoplay", "autoplay");
        videoElement.setAttribute("width", "200");
        videoElement.src = URL.createObjectURL(stream);
        const container = <HTMLElement>document.getElementById("video");
        container.insertAdjacentElement("beforeend", name);
        container.insertAdjacentElement("beforeend", videoElement);
        this.setCanvas(videoElement, index+1);
    }

    private setCanvas(video: HTMLVideoElement, number: number) {
        const canvas = <HTMLCanvasElement>document.getElementById("conpose-canvas");
        const context = <CanvasRenderingContext2D>canvas.getContext("2d");
        // const cx = canvas.width - ((number + 1) * video.width);
        // const cy = (number % 4) * video.height;
        const cx = 800 - ((number + 1) * 200);
        const cy = 0;

        //鏡合わせにする
        canvas.style.transform = "scaleX(-1)";
        // context.drawImage(video, cx, cy, video.width, (video.width * video.videoHeight) / video.videoWidth);
        context.drawImage(video, cx, cy, 200, 200);
        requestAnimationFrame(() => this.setCanvas(video, number));
    }

    private getComposeCanvas() {
        const canvas: any = <HTMLCanvasElement>document.getElementById("conpose-canvas");
        this.conposedVideo = canvas.captureStream();
        this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);

        const conposed = <HTMLVideoElement>document.getElementById("conposed-stream");
        conposed.src = URL.createObjectURL(this.conposedVideo);
    }
}

window.onload = () => {
    let index = 0;
    const multi: MultiVideoChat = new MultiVideoChat();
    multi.start(index);
    multi.showSelf(index);
    multi.waitToCall(index);
};
