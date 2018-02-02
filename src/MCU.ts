import HandlePeer from "./HandlePeer";
import HandleAudio from "./HandleAudio";

class MultiVideoChat {
    private peer: Array<HandlePeer> = [];
    private index = 0;
    private conposedVideo: MediaStream;
    private audio = new HandleAudio();
    private conposedStream = new MediaStream();

    public init() {
        //初回にログインの表示を行う
        if(this.index == 0) {
            this.setVisible("login", true);
            this.setVisible("connect", false);

            //canvasをstreamとして取得する
            this.getComposeCanvas();
        }

        this.peer[this.index] = new HandlePeer();
        this.peer[this.index].opened()
            .then((id: string) => {
                // idをテーブルに追加する
                const tbody = <HTMLElement>document.getElementById("dest");
                const tr = <HTMLElement>document.createElement("tr");
                tr.setAttribute("id", this.index.toString());
                tr.insertAdjacentHTML("beforeend", `<td>${id}</td>`);
                tbody.insertAdjacentElement("beforeend", tr);

                const table = <HTMLElement>document.getElementById("dest-table");
                table.scrollTop = table.scrollHeight;
            })
            .catch((reason: any) => console.error(reason));

        this.peer[this.index].error()
            .then((error: any) => console.error(error))
            .catch((reason: any) => console.error(reason));
    }

    public login() {
        const login = <HTMLInputElement>document.getElementById("loginbutton");
        login.addEventListener("click", () => {
            const nameElement: HTMLInputElement = <HTMLInputElement>document.getElementById("name");
            const name: string = nameElement.value;

            if (name) {
                this.peer[this.index].setName(name);
                const namebox = <HTMLElement>document.getElementById("namebox");
                namebox.insertAdjacentText("beforeend", ` ${name}`);

                this.peer[this.index].getUserMedia()
                    .then((stream: MediaStream) => {
                        this.setSelfStreamForCanvas(stream);
                        this.audio.addStream(stream);
                    })
                    .catch((reason: any) => console.error(reason));

                this.setVisible("login", false);
                this.setVisible("connect", true);
            }
        });

    }

    public waitToCall() {
        //     this.peer[this.index].connected((destName: string) => {
        //         console.error(destName);
        //     })
        //         .then((data) => {
        //             console.log(data);
        //         })
        //         .catch((reason: any) => console.error(reason));

        this.peer[this.index].called(this.conposedStream)
            .then((dest: { name: string, stream: MediaStream }) => {
                const tr = <HTMLElement>document.getElementById(this.index.toString());
                tr.insertAdjacentHTML("beforeend", `<td>${dest.name}</td>`);

                this.setStreamForCanvas(dest.stream);
                const audioStream = this.audio.addStream(dest.stream);
                this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
                this.conposedStream.addTrack(audioStream.getAudioTracks()[0]);

                // 新しくPeerインスタンスを生成し、接続を待つ
                this.index++;
                this.init();
                this.waitToCall();
            })
            .catch((reason: any) => console.error(reason));

        // this.disconnectEvent();
    }

    // private disconnectEvent() {
    //     const dissconnectFirst= <HTMLInputElement>document.getElementById("dissconnectbutton");
    //     dissconnectFirst.addEventListener("click", () => {
    //         this.peer[this.index].reset();
    //     });
    // }

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

        // fix 取得したstreamを表示する
        const container = <HTMLElement>document.getElementById("videos");
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

    private setVisible(id: string, visible: boolean) {
        const element = <HTMLElement>document.getElementById(id);
        visible ? element.removeAttribute("hidden") : element.setAttribute("hidden", "");
    }
}

window.onload = () => {
    const multi: MultiVideoChat = new MultiVideoChat();
    multi.init();
    multi.login();
    multi.waitToCall();
};
