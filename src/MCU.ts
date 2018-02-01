import HandlePeer from "./HandlePeer";
import HandleAudio from "./HandleAudio";

class MultiVideoChat {
    private peer: Array<HandlePeer> = [];
    private index = 0;
    private conposedVideo: MediaStream;
    private audio = new HandleAudio();
    private conposedStream = new MediaStream();

    public start() {
        //canvasをstreamとして取得する
        this.getComposeCanvas();

        this.peer[this.index] = new HandlePeer();
        this.peer[this.index].opened()
            .then((id: any) => {
                const container = <HTMLElement>document.getElementById("peerid");
                const idElement = document.createElement("div");
                idElement.textContent = id;
                container.insertAdjacentElement("beforeend", idElement);
            })
            .catch((reason: any) => console.error(reason));

        this.peer[this.index].error()
            .then((error: any) => console.error(error))
            .catch((reason: any) => console.error(reason));
    }

    public showSelf() {
        this.peer[this.index].getUserMedia()
            .then((stream: MediaStream) => {
                this.setSelfStreamForCanvas(stream);
                this.audio.addStream(stream);
            })
            .catch((reason: any) => console.error(reason));
    }

    public waitToCall() {
        this.peer[this.index].called(this.conposedStream)
            .then((stream: MediaStream) => {
                this.setStreamForCanvas(stream);
                const audioStream = this.audio.addStream(stream);
                this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
                this.conposedStream.addTrack(audioStream.getAudioTracks()[0]);

                this.index++;
                this.start();
                this.showSelf();
                this.waitToCall();
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

    private setSelfStreamForCanvas(stream: MediaStream) {
        const video = <HTMLVideoElement>document.getElementById("video-self");
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 0);
    }

    private setStreamForCanvas(stream: MediaStream) {
        const videoElement = <HTMLVideoElement>document.createElement("video");
        videoElement.setAttribute("autoplay", "autoplay");
        videoElement.setAttribute("width", "200");
        videoElement.src = URL.createObjectURL(stream);

        const container = <HTMLElement>document.getElementById("video");
        container.insertAdjacentElement("beforeend", videoElement);

        this.setCanvas(videoElement, this.index + 1);
    }

    private setCanvas(video: HTMLVideoElement, number: number) {
        const canvas = <HTMLCanvasElement>document.getElementById("conpose-canvas");
        const context = <CanvasRenderingContext2D>canvas.getContext("2d");
        const cx = number % 4 * canvas.width / 4;
        const cy = Math.floor(number / 4) * canvas.width / 4;

        //鏡合わせにする
        canvas.style.transform = "scaleX(-1)";
        context.drawImage(video, cx, cy, video.width, (video.width * video.videoHeight) / video.videoWidth);
        requestAnimationFrame(() => this.setCanvas(video, number));
    }

    private getComposeCanvas() {
        const canvas: any = <HTMLCanvasElement>document.getElementById("conpose-canvas");
        this.conposedVideo = canvas.captureStream();
        this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
    }
}

window.onload = () => {
    const multi: MultiVideoChat = new MultiVideoChat();
    multi.start();
    multi.showSelf();
    multi.waitToCall();
};
