class MultiVideoChat {
    private firstPeer: HandlePeer;
    private context: any;
    private conposedVideo: MediaStream;
    private audio: HandleAudio;
    private conposedStream = new MediaStream();


    public start() {
        //受け取ったストリームを画面をcanvasに出力する
        this.setConposedScreen();

        this.firstPeer = new HandlePeer();
        this.firstPeer.opened()
            .then((id: any) => {
                const idElement = <HTMLElement>document.getElementById("peerid-first");
                idElement.innerHTML = id;
            })
            .catch((reason: any) => console.error(reason));
        this.firstPeer.error()
            .then((error: any) => console.error(error))
            .catch((reason: any) => console.error(reason));
        this.firstPeer.called(this.conposedStream)
            .then((stream: any) => {
                this.showVideoFirst(stream);
                const audioStream = this.audio.addStream(stream);
                this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
                this.conposedStream.addTrack(audioStream.getAudioTracks()[0]);

                //fix 合成したストリームを表示する
                const video = <HTMLVideoElement>document.getElementById("test");
                video.src = URL.createObjectURL(this.conposedStream);
            })
            .catch((reason: any) => console.error(reason));
        this.firstPeer.getUserMedia()
            .then((stream: any) => {
                this.showVideoSelf(stream);
                this.audio = new HandleAudio(stream);
            })
            .catch((reason: any) => console.error(reason));

        this.loginEvent();
        this.dissconnectEvent();
    }

    private loginEvent() {
        // this.setVisible("connect", false);

        const login = <HTMLInputElement>document.getElementById("loginbutton");
        login.addEventListener("click", () => {
            const nameElement: HTMLInputElement = <HTMLInputElement>document.getElementById("name");
            const name: string = nameElement.value;

            if (name) {
                this.firstPeer.setName(name);
                const namebox: HTMLElement = <HTMLElement>document.getElementById("namebox");
                namebox.innerHTML = name;

                // this.setVisible("login", false);
                // this.setVisible("connect", true);
            }
        });
    }

    private dissconnectEvent() {
        const dissconnectFirst: HTMLInputElement = <HTMLInputElement>document.getElementById("dissconnectbutton");
        dissconnectFirst.addEventListener("click", () => {
            this.firstPeer.reset();

            // this.setVisible("login", true);
            // this.setVisible("connect", false);
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

        const conposed = <HTMLVideoElement>document.getElementById("conposed-stream");
        conposed.src = URL.createObjectURL(this.conposedVideo);
    }

    private setVisible(id: string, visible: boolean) {
        const element: HTMLElement = <HTMLElement>document.getElementById(id);
        visible ? element.style.display = "block" : element.style.display = "none";
    }
}

window.onload = () => {
    const multi: MultiVideoChat = new MultiVideoChat();
    multi.start();
};
